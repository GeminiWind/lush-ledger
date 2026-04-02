import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { fromISODate, nowDate, startOfMonthDate } from "@/lib/date";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  const userId = session?.sub;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const targetAmount = toNumber(body.targetAmount);
  const monthlyContribution = toNumber(body.monthlyContribution);
  const targetDate = fromISODate(String(body.targetDate || ""));
  const requestedPrimary = Boolean(body.isPrimary);
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

  if (!targetDate) {
    return NextResponse.json({ error: "Target date is invalid." }, { status: 400 });
  }

  const monthStart = startOfMonthDate(nowDate());

  if (targetDate < monthStart) {
    return NextResponse.json({ error: "Target date must be this month or later." }, { status: 400 });
  }

  const existingPrimary = await prisma.savingsPlan.findFirst({
    where: {
      userId,
      status: "active",
      isPrimary: true,
    },
    select: { id: true },
  });

  const nextIsPrimary = requestedPrimary || !existingPrimary;

  const plan = await prisma.$transaction(async (tx) => {
    if (nextIsPrimary) {
      await tx.savingsPlan.updateMany({
        where: { userId, status: "active", isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return tx.savingsPlan.create({
      data: {
        userId,
        name,
        icon,
        status: "active",
        isPrimary: nextIsPrimary,
        targetAmount,
        monthlyContribution,
        targetDate,
      },
    });
  });

  return NextResponse.json({ plan }, { status: 201 });
};
