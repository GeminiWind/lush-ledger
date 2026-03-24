import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export const POST = async () => {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
};
