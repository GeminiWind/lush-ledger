import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { ensureDefaultWallet } from "@/lib/wallet";

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureDefaultWallet(session.sub);

  const accounts = await prisma.account.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ accounts });
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const type = String(body.type || "checking");
  const openingBalance = Number(body.openingBalance || 0);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const account = await prisma.account.create({
    data: {
      userId: session.sub,
      name,
      type,
      openingBalance: isNaN(openingBalance) ? 0 : openingBalance,
    },
  });

  return NextResponse.json({ account });
};
