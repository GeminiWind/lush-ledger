import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie, signToken } from "@/lib/auth";
import {
  clearBackoff,
  getAuthBackoffKey,
  getRemainingBackoffMs,
  registerBackoffFailure,
} from "@/lib/rate-limit";
import {
  getPasswordPolicyIssues,
  isValidEmailFormat,
  normalizeEmail,
} from "@/features/auth/validation";

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = normalizeEmail(String(body.email || ""));
    const password = String(body.password || "");
    const acceptedTerms = Boolean(body.acceptedTerms);
    const backoffKey = getAuthBackoffKey(request, "register", email);

    const remainingMs = getRemainingBackoffMs(backoffKey);
    if (remainingMs > 0) {
      return NextResponse.json(
        {
          error: "Too many attempts. Please wait before trying again.",
          retryAfterMs: remainingMs,
        },
        { status: 429 }
      );
    }

    const errors: Record<string, string> = {};

    if (fullName.length < 2) {
      errors.fullName = "Full name must be at least 2 characters.";
    }

    if (!email) {
      errors.email = "Email is required.";
    } else if (!isValidEmailFormat(email)) {
      errors.email = "Email format is invalid.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else {
      const passwordIssues = getPasswordPolicyIssues(password);
      if (passwordIssues.length > 0) {
        errors.password = `Password must include ${passwordIssues.join(", ")}.`;
      }
    }

    if (!acceptedTerms) {
      errors.acceptedTerms = "You must accept terms.";
    }

    if (Object.keys(errors).length > 0) {
      const waitMs = registerBackoffFailure(backoffKey);
      return NextResponse.json(
        {
          error: "Please correct highlighted fields.",
          errors,
          retryAfterMs: waitMs,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const waitMs = registerBackoffFailure(backoffKey);
      return NextResponse.json(
        { error: "Email already exists.", retryAfterMs: waitMs },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        name: fullName,
        email,
        passwordHash: await hashPassword(password),
        settings: { create: { currency: "VND" } },
        accounts: {
          create: {
            name: "Main Wallet",
            type: "cash",
            openingBalance: 0,
          },
        },
      },
    });

    const token = await signToken({ sub: user.id, email: user.email });
    await setSessionCookie(token);
    clearBackoff(backoffKey);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
    }

    return NextResponse.json(
      { error: "Unable to register account." },
      { status: 500 }
    );
  }
};
