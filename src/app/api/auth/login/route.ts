import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionCookie, signToken, verifyPassword } from "@/lib/auth";

export const POST = async (request: Request) => {
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const remember = Boolean(body.remember);

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = await signToken(
    { sub: user.id, email: user.email },
    remember ? "30d" : "12h"
  );
  await setSessionCookie(token, remember ? 60 * 60 * 24 * 30 : undefined);

  return NextResponse.json({ ok: true });
};
