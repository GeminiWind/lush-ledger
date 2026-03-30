import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { ensureMonthlyCapSnapshot, monthStartOf } from "@/lib/monthly-cap";

const toNumber = (value: unknown) => Number(value ?? 0);

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const PATCH = async (request: NextRequest, context: RouteContext) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.sub;

  const { id } = await context.params;
  const body = await request.json();

  const name = String(body.name || "").trim();
  const icon = String(body.icon || "category").trim() || "category";
  const monthlyLimit = Number(body.monthlyLimit || 0);
  const warningEnabled = body.warningEnabled !== false;
  const warnAt = Number(body.warnAt ?? 80);
  const keepLimitNextMonth = body.keepLimitNextMonth !== false;

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
    return NextResponse.json({ error: "Monthly limit must be zero or greater." }, { status: 400 });
  }

  if (!Number.isFinite(warnAt) || warnAt < 1 || warnAt > 100) {
    return NextResponse.json({ error: "Warn threshold must be between 1 and 100." }, { status: 400 });
  }

  const now = new Date();
  const currentMonth = monthStartOf(now);
  const nextMonth = monthStartOf(new Date(now.getFullYear(), now.getMonth() + 1, 1));

  const [currentCap, nextCap] = await Promise.all([
    ensureMonthlyCapSnapshot(userId, currentMonth),
    ensureMonthlyCapSnapshot(userId, nextMonth),
  ]);

  const [currentMonthLimits, nextMonthLimits, currentExistingLimit, nextExistingLimit] = await Promise.all([
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart: currentMonth },
      select: { categoryId: true, limit: true },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart: nextMonth },
      select: { categoryId: true, limit: true },
    }),
    prisma.categoryMonthlyLimit.findUnique({
      where: {
        userId_categoryId_monthStart: {
          userId,
          categoryId: id,
          monthStart: currentMonth,
        },
      },
      select: { limit: true },
    }),
    prisma.categoryMonthlyLimit.findUnique({
      where: {
        userId_categoryId_monthStart: {
          userId,
          categoryId: id,
          monthStart: nextMonth,
        },
      },
      select: { limit: true },
    }),
  ]);

  const currentAllocated = currentMonthLimits.reduce((sum, row) => sum + toNumber(row.limit), 0);
  const currentExisting = toNumber(currentExistingLimit?.limit);
  const projectedCurrentAllocated = currentAllocated - currentExisting + monthlyLimit;
  const currentCapValue = toNumber(currentCap.totalCap);

  if (projectedCurrentAllocated > currentCapValue) {
    const overBy = projectedCurrentAllocated - currentCapValue;
    return NextResponse.json(
      {
        error: `Category limits exceed monthly cap by ${overBy}. Increase monthly cap or lower category limit.`,
      },
      { status: 400 },
    );
  }

  const nextAllocated = nextMonthLimits.reduce((sum, row) => sum + toNumber(row.limit), 0);
  const nextExisting = toNumber(nextExistingLimit?.limit);
  const nextLimitValue = keepLimitNextMonth ? monthlyLimit : 0;
  const projectedNextAllocated = nextAllocated - nextExisting + nextLimitValue;
  const nextCapValue = toNumber(nextCap.totalCap);

  if (projectedNextAllocated > nextCapValue) {
    const overBy = projectedNextAllocated - nextCapValue;
    return NextResponse.json(
      {
        error: `Next month category limits exceed monthly cap by ${overBy}. Increase next month cap or disable keep limit next month.`,
      },
      { status: 400 },
    );
  }

  const category = await prisma.$transaction(async (tx) => {
    const existing = await tx.category.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const updated = await tx.category.update({
      where: { id: existing.id },
      data: { name, icon },
    });

    await tx.categoryMonthlyLimit.upsert({
      where: {
        userId_categoryId_monthStart: {
          userId,
          categoryId: existing.id,
          monthStart: currentMonth,
        },
      },
      create: {
        userId,
        categoryId: existing.id,
        monthStart: currentMonth,
        limit: monthlyLimit,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
      update: {
        limit: monthlyLimit,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
    });

    await tx.categoryMonthlyLimit.upsert({
      where: {
        userId_categoryId_monthStart: {
          userId,
          categoryId: existing.id,
          monthStart: nextMonth,
        },
      },
      create: {
        userId,
        categoryId: existing.id,
        monthStart: nextMonth,
        limit: keepLimitNextMonth ? monthlyLimit : 0,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
      update: {
        limit: keepLimitNextMonth ? monthlyLimit : 0,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
    });

    return updated;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return null;
    }
    throw error;
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  await Promise.all([
    ensureMonthlyCapSnapshot(userId, currentMonth),
    ensureMonthlyCapSnapshot(userId, nextMonth),
  ]);

  return NextResponse.json({ category });
};

export const DELETE = async (request: NextRequest, context: RouteContext) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.sub;
  const { id } = await context.params;

  const deleted = await prisma.$transaction(async (tx) => {
    const existing = await tx.category.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!existing) {
      return null;
    }

    await tx.transaction.updateMany({
      where: { userId, categoryId: existing.id },
      data: { categoryId: null },
    });

    await tx.categoryMonthlyLimit.deleteMany({
      where: { userId, categoryId: existing.id },
    });

    await tx.category.delete({
      where: { id: existing.id },
    });

    return existing.id;
  });

  if (!deleted) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  await ensureMonthlyCapSnapshot(userId, new Date());

  return NextResponse.json({ ok: true });
};
