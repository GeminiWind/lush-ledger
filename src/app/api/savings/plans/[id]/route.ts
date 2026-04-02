import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { fromISODate, nowDate, startOfMonthDate } from "@/lib/date";

const SAVINGS_PLAN_STATUSES = ["active", "archive", "cancelled"] as const;

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const isDefined = <T>(value: T | undefined): value is T => typeof value !== "undefined";

export const PATCH = async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await getSessionFromRequest(request);
  const userId = session?.sub;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const plan = await prisma.savingsPlan.findFirst({
    where: { id, userId },
    select: { id: true, name: true, status: true, isPrimary: true },
  });

  if (!plan) {
    return NextResponse.json({ error: "Savings plan not found." }, { status: 404 });
  }

  const body = await request.json();
  const requestedName = typeof body.name === "string" ? body.name.trim() : undefined;
  const requestedTargetAmount = isDefined(body.targetAmount) ? toNumber(body.targetAmount) : undefined;
  const requestedMonthlyContribution = isDefined(body.monthlyContribution) ? toNumber(body.monthlyContribution) : undefined;
  const requestedTargetDate = isDefined(body.targetDate) ? fromISODate(String(body.targetDate)) : undefined;
  const requestedIsPrimary = typeof body.isPrimary === "boolean" ? body.isPrimary : undefined;
  const requestedIcon = typeof body.icon === "string" ? String(body.icon).trim() || "savings" : undefined;
  const requestedStatus = typeof body.status === "string" ? body.status : undefined;
  const requestedCancellationReason = typeof body.cancellationReason === "string" ? body.cancellationReason.trim() : "";
  const requestedCancellationNote = typeof body.cancellationNote === "string" ? body.cancellationNote.trim() : "";

  if (requestedName !== undefined && !requestedName) {
    return NextResponse.json({ error: "Plan name is required." }, { status: 400 });
  }

  if (requestedTargetAmount !== undefined && (!Number.isFinite(requestedTargetAmount) || requestedTargetAmount <= 0)) {
    return NextResponse.json({ error: "Savings target must be greater than zero." }, { status: 400 });
  }

  if (
    requestedMonthlyContribution !== undefined &&
    (!Number.isFinite(requestedMonthlyContribution) || requestedMonthlyContribution <= 0)
  ) {
    return NextResponse.json({ error: "Monthly contribution must be greater than zero." }, { status: 400 });
  }

  if (requestedTargetDate !== undefined) {
    if (!requestedTargetDate) {
      return NextResponse.json({ error: "Target date is invalid." }, { status: 400 });
    }

    const monthStart = startOfMonthDate(nowDate());

    if (requestedTargetDate < monthStart) {
      return NextResponse.json({ error: "Target date must be this month or later." }, { status: 400 });
    }
  }

  if (requestedStatus !== undefined && !SAVINGS_PLAN_STATUSES.includes(requestedStatus as (typeof SAVINGS_PLAN_STATUSES)[number])) {
    return NextResponse.json({ error: "Savings plan status is invalid." }, { status: 400 });
  }

  if (
    requestedName === undefined &&
    requestedTargetAmount === undefined &&
    requestedMonthlyContribution === undefined &&
    requestedTargetDate === undefined &&
    requestedIsPrimary === undefined &&
    requestedIcon === undefined &&
    requestedStatus === undefined
  ) {
    return NextResponse.json({ error: "No changes provided." }, { status: 400 });
  }

  const planTransactions = await prisma.transaction.findMany({
    where: { userId, savingsPlanId: id },
    select: { amount: true, type: true },
  });

  const currentSaved = Math.max(
    0,
    planTransactions.reduce((sum, tx) => {
      const amount = Number(tx.amount ?? 0);
      return sum + (tx.type === "expense" || tx.type === "refund" ? -amount : amount);
    }, 0)
  );

  if (requestedTargetAmount !== undefined && requestedTargetAmount < currentSaved) {
    return NextResponse.json({ error: "Savings target must be greater than or equal to current saved amount." }, { status: 400 });
  }

  const updatedPlan = await prisma.$transaction(async (tx) => {
    const nextStatus = requestedStatus ?? plan.status;
    const nextIsPrimary = nextStatus === "active" ? requestedIsPrimary ?? plan.isPrimary : false;

    if (nextIsPrimary) {
      await tx.savingsPlan.updateMany({
        where: { userId, status: "active", isPrimary: true, id: { not: id } },
        data: { isPrimary: false },
      });
    }

    const savedPlan = await tx.savingsPlan.update({
      where: { id },
      data: {
        ...(requestedName !== undefined ? { name: requestedName } : {}),
        ...(requestedIcon !== undefined ? { icon: requestedIcon } : {}),
        ...(requestedTargetAmount !== undefined ? { targetAmount: requestedTargetAmount } : {}),
        ...(requestedMonthlyContribution !== undefined ? { monthlyContribution: requestedMonthlyContribution } : {}),
        ...(requestedTargetDate !== undefined ? { targetDate: requestedTargetDate } : {}),
        ...(requestedStatus !== undefined ? { status: requestedStatus } : {}),
        isPrimary: nextIsPrimary,
      },
    });

    const shouldCreateRefund = requestedStatus === "cancelled" && plan.status === "active" && currentSaved > 0;

    if (shouldCreateRefund) {
      const defaultWallet =
        (await tx.account.findFirst({
          where: { userId, isDefault: true },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        })) ||
        (await tx.account.findFirst({
          where: { userId },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        })) ||
        (await tx.account.create({
          data: {
            userId,
            name: "Main Wallet",
            type: "cash",
            isDefault: true,
            openingBalance: 0,
          },
          select: { id: true },
        }));

      const noteSegments = [
        `Refund from cancelled savings plan: ${plan.name}`,
        requestedCancellationReason ? `Reason: ${requestedCancellationReason}` : "",
        requestedCancellationNote ? `Note: ${requestedCancellationNote}` : "",
      ].filter(Boolean);

      await tx.transaction.create({
        data: {
          userId,
          accountId: defaultWallet.id,
          savingsPlanId: id,
          type: "refund",
          amount: currentSaved,
          date: nowDate(),
          notes: noteSegments.join(" | "),
        },
      });
    }

    if (plan.isPrimary && savedPlan.status !== "active") {
      const fallbackPrimary = await tx.savingsPlan.findFirst({
        where: { userId, status: "active", id: { not: id } },
        orderBy: [{ isPrimary: "desc" }, { targetDate: "asc" }, { createdAt: "asc" }],
        select: { id: true },
      });

      if (fallbackPrimary) {
        await tx.savingsPlan.update({
          where: { id: fallbackPrimary.id },
          data: { isPrimary: true },
        });
      }
    }

    return savedPlan;
  });

  return NextResponse.json({ plan: updatedPlan, currentSaved }, { status: 200 });
};
