import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const PATCH = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getSessionFromRequest(request);
  const userId = session?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await prisma.savingsPlan.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!plan) {
    return NextResponse.json({ error: "Savings plan not found." }, { status: 404 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const targetAmount = toNumber(body.targetAmount);
  const monthlyContribution = toNumber(body.monthlyContribution);
  const targetDate = new Date(String(body.targetDate || ""));
  const isPrimary = Boolean(body.isPrimary);
  const icon = String(body.icon || "savings").trim() || "savings";

  if (!name) {
    return NextResponse.json({ error: "Plan name is required." }, { status: 400 });
  }

  if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
    return NextResponse.json({ error: "Savings target must be greater than zero." }, { status: 400 });
  }

  if (!Number.isFinite(monthlyContribution) || monthlyContribution <= 0) {
    return NextResponse.json({ error: "Monthly contribution must be greater than zero." }, { status: 400 });
  }

  if (Number.isNaN(targetDate.getTime())) {
    return NextResponse.json({ error: "Target date is invalid." }, { status: 400 });
  }

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  if (targetDate < monthStart) {
    return NextResponse.json({ error: "Target date must be this month or later." }, { status: 400 });
  }

  const planTransactions = await prisma.transaction.findMany({
    where: { userId, savingsPlanId: id },
    select: { amount: true, type: true },
  });

  const currentSaved = Math.max(
    0,
    planTransactions.reduce((sum, tx) => {
      const amount = Number(tx.amount ?? 0);
      return sum + (tx.type === "expense" ? -amount : amount);
    }, 0)
  );

  if (targetAmount < currentSaved) {
    return NextResponse.json({ error: "Savings target must be greater than or equal to current saved amount." }, { status: 400 });
  }

  const updatedPlan = await prisma.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.savingsPlan.updateMany({
        where: { userId, status: "active", isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    return tx.savingsPlan.update({
      where: { id },
      data: {
        name,
        icon,
        targetAmount,
        monthlyContribution,
        targetDate,
        isPrimary,
      },
    });
  });

  return NextResponse.json({ plan: updatedPlan, currentSaved }, { status: 200 });
};
