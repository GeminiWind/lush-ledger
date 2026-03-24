import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie, signToken } from "@/lib/auth";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const acceptedTerms = Boolean(body.acceptedTerms);

    if (
      fullName.length < 2 ||
      !email ||
      !password ||
      password.length < 8 ||
      !acceptedTerms
    ) {
      return NextResponse.json(
        {
          error:
            "Full name, email, password (8+ chars), and terms agreement are required.",
        },
        { status: 400 }
      );
    }

    if (password.length > 72) {
      return NextResponse.json(
        { error: "Password must be 72 characters or less." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already exists." }, { status: 409 });
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
