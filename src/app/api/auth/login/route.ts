import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionCookie, signToken, verifyPassword } from "@/lib/auth";
import {
  clearBackoff,
  getAuthBackoffKey,
  getRemainingBackoffMs,
  registerBackoffFailure,
} from "@/lib/rate-limit";
import { isValidEmailFormat, normalizeEmail } from "@/features/auth/validation";

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const email = normalizeEmail(String(body.email || ""));
  const password = String(body.password || "");
  const remember = Boolean(body.remember);
  const backoffKey = getAuthBackoffKey(request, "login", email);

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

  if (!email) {
    errors.email = "Email is required.";
  } else if (!isValidEmailFormat(email)) {
    errors.email = "Email format is invalid.";
  }

  if (!password) {
    errors.password = "Password is required.";
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

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const waitMs = registerBackoffFailure(backoffKey);
    return NextResponse.json(
      { error: "Invalid credentials.", retryAfterMs: waitMs },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    const waitMs = registerBackoffFailure(backoffKey);
    return NextResponse.json(
      { error: "Invalid credentials.", retryAfterMs: waitMs },
      { status: 401 }
    );
  }

  clearBackoff(backoffKey);

  const token = await signToken(
    { sub: user.id, email: user.email },
    remember ? "30d" : "12h"
  );
  await setSessionCookie(token, remember ? 60 * 60 * 24 * 30 : undefined);

  return NextResponse.json({ ok: true });
};
