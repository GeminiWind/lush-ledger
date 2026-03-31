import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || "").trim();
  const targetAmount = toNumber(body.targetAmount);
  const monthlyContribution = toNumber(body.monthlyContribution);
  const targetDate = new Date(String(body.targetDate || ""));

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

  const existingPrimary = await prisma.savingsPlan.findFirst({
    where: {
      userId: session.sub,
      status: "active",
      isPrimary: true,
    },
    select: { id: true },
  });

  const plan = await prisma.savingsPlan.create({
    data: {
      userId: session.sub,
      name,
      status: "active",
      isPrimary: !existingPrimary,
      targetAmount,
      monthlyContribution,
      targetDate,
    },
  });

  return NextResponse.json({ plan }, { status: 201 });
};
