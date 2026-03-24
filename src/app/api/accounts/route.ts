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
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
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
  const setAsDefault = body.setAsDefault === true;

  const allowedTypes = new Set(["cash", "checking", "savings", "credit"]);

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!allowedTypes.has(type)) {
    return NextResponse.json({ error: "Invalid wallet type." }, { status: 400 });
  }

  if (!Number.isFinite(openingBalance) || openingBalance < 0) {
    return NextResponse.json({ error: "Opening balance must be a valid non-negative number." }, { status: 400 });
  }

  const account = await prisma.$transaction(async (tx) => {
    const existingDefault = await tx.account.findFirst({
      where: { userId: session.sub, isDefault: true },
      select: { id: true },
    });

    const shouldSetDefault = setAsDefault || !existingDefault;

    if (shouldSetDefault) {
      await tx.account.updateMany({
        where: { userId: session.sub, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.account.create({
      data: {
        userId: session.sub,
        name,
        type,
        isDefault: shouldSetDefault,
        openingBalance,
      },
    });
  });

  return NextResponse.json({ account });
};
