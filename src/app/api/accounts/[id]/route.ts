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
  const balance = Number(body.balance);

  if (!Number.isFinite(balance) || balance < 0) {
    return NextResponse.json({ error: "Balance must be a valid non-negative number." }, { status: 400 });
  }

  const wallet = await prisma.account.findFirst({
    where: { id, userId: session.sub },
  });

  if (!wallet) {
    return NextResponse.json({ error: "Wallet not found." }, { status: 404 });
  }

  const walletTransactions = await prisma.transaction.findMany({
    where: { userId: session.sub, accountId: wallet.id },
    select: { type: true, amount: true },
  });

  const movement = walletTransactions.reduce((sum, tx) => {
    const amount = toNumber(tx.amount);
    return tx.type === "income" ? sum + amount : sum - amount;
  }, 0);

  const openingBalance = balance - movement;

  const updated = await prisma.account.update({
    where: { id: wallet.id },
    data: { openingBalance },
  });

  return NextResponse.json({ wallet: updated });
};
