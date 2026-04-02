import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";

const toNumber = (value: unknown) => Number(value ?? 0);

export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const wallet = await prisma.account.findFirst({
    where: { id, userId: session.sub },
  });

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
  }

  if (Object.prototype.hasOwnProperty.call(body, "balance") && !Object.prototype.hasOwnProperty.call(body, "name")) {
    const balance = Number(body.balance);

    if (!Number.isFinite(balance) || balance < 0) {
      return NextResponse.json({ error: "Balance must be a valid non-negative number." }, { status: 400 });
    }

    const walletTransactions = await prisma.transaction.findMany({
      where: { userId: session.sub, accountId: wallet.id },
      select: { type: true, amount: true },
    });

    const movement = walletTransactions.reduce((sum, tx) => {
      const amount = toNumber(tx.amount);
      return tx.type === "income" || tx.type === "refund" ? sum + amount : sum - amount;
    }, 0);

    const openingBalance = balance - movement;

    const updated = await prisma.account.update({
      where: { id: wallet.id },
      data: { openingBalance },
    });

    return NextResponse.json({ wallet: updated });
  }

  const name = String(body.name || "").trim();
  const openingBalance = Number(body.openingBalance);
  const setAsDefault = body.setAsDefault === true;

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!Number.isFinite(openingBalance) || openingBalance < 0) {
    return NextResponse.json({ error: "Opening balance must be a valid non-negative number." }, { status: 400 });
  }

  const updated = await prisma.$transaction(async (tx) => {
    const shouldSetDefault = setAsDefault || wallet.isDefault;

    if (shouldSetDefault) {
      await tx.account.updateMany({
        where: { userId: session.sub, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.account.update({
      where: { id: wallet.id },
      data: {
        name,
        openingBalance,
        isDefault: shouldSetDefault,
      },
    });
  });

  return NextResponse.json({ wallet: updated });
};

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const wallet = await prisma.account.findFirst({
    where: { id, userId: session.sub },
  });

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
  }

  if (wallet.isDefault) {
    return NextResponse.json({ error: "Default wallet cannot be deleted." }, { status: 400 });
  }

  const linkedTxCount = await prisma.transaction.count({
    where: { userId: session.sub, accountId: wallet.id },
  });

  if (linkedTxCount > 0) {
    return NextResponse.json({ error: "Wallet has transactions and cannot be deleted." }, { status: 400 });
  }

  await prisma.account.delete({ where: { id: wallet.id } });

  return NextResponse.json({ ok: true });
};
