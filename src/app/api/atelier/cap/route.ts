import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addMonthsDate, fromISODate, monthKey, nowDate, startOfMonthDate } from "@/lib/date";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

const toNumber = (value: unknown) => Number(value ?? 0);

const normalizeMonthStart = (value: string | undefined) => {
  if (!value) {
    return startOfMonthDate(nowDate());
  }

  const parsed = fromISODate(`${value}-01`);
  if (!parsed) {
    return null;
  }

  return startOfMonthDate(parsed);
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

  const nextMonthStart = startOfMonthDate(addMonthsDate(monthStart, 1));
  const nextSnapshot = await ensureMonthlyCapSnapshot(session.sub, nextMonthStart);
  const nextLimitTotal = toNumber(nextSnapshot.totalLimit);
  const nextTotalCap = keepCapNextMonth ? targetCap : nextLimitTotal;
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
    month: monthKey(monthStart),
    totalCap: targetCap,
    unallocatedBackup,
    keepCapNextMonth,
  });
};
