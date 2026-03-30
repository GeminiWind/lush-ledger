import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeMonthStart = (value: string | undefined) => {
  if (!value) {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  const parsed = new Date(`${value}-01`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(parsed.getFullYear(), parsed.getMonth(), 1);
};

export const PATCH = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const targetCap = Number(body.totalCap);
  const keepCapNextMonth = body.keepCapNextMonth !== false;
  const monthStart = normalizeMonthStart(
    typeof body.month === "string" ? body.month.trim() : undefined,
  );

  if (!Number.isFinite(targetCap) || targetCap < 0) {
    return NextResponse.json({ error: "totalCap must be a non-negative number." }, { status: 400 });
  }

  if (!monthStart) {
    return NextResponse.json({ error: "month must be in YYYY-MM format." }, { status: 400 });
  }

  const snapshot = await ensureMonthlyCapSnapshot(session.sub, monthStart);
  const monthlyLimitTotal = toNumber(snapshot.totalLimit);

  if (targetCap < monthlyLimitTotal) {
    return NextResponse.json(
      { error: "totalCap must be greater than or equal to total monthly limits." },
      { status: 400 },
    );
  }

  const unallocatedBackup = targetCap - monthlyLimitTotal;

  await prisma.userMonthlyCap.update({
    where: {
      userId_monthStart: {
        userId: session.sub,
        monthStart,
      },
    },
    data: {
      unallocatedBackup,
      totalCap: targetCap,
    },
  });

  const nextMonthStart = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
  const nextSnapshot = await ensureMonthlyCapSnapshot(session.sub, nextMonthStart);
  const nextLimitTotal = toNumber(nextSnapshot.totalLimit);
  const rawNextCap = keepCapNextMonth ? targetCap : 0;
  const nextTotalCap = Math.max(rawNextCap, nextLimitTotal);
  const nextUnallocatedBackup = Math.max(nextTotalCap - nextLimitTotal, 0);

  await prisma.userMonthlyCap.upsert({
    where: {
      userId_monthStart: {
        userId: session.sub,
        monthStart: nextMonthStart,
      },
    },
    create: {
      userId: session.sub,
      monthStart: nextMonthStart,
      totalLimit: nextLimitTotal,
      totalCap: nextTotalCap,
      unallocatedBackup: nextUnallocatedBackup,
    },
    update: {
      totalLimit: nextLimitTotal,
      totalCap: nextTotalCap,
      unallocatedBackup: nextUnallocatedBackup,
    },
  });

  return NextResponse.json({
    ok: true,
    month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`,
    totalCap: targetCap,
    unallocatedBackup,
    keepCapNextMonth,
  });
};
