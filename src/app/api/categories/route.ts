import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { addMonthsDate, nowDate } from "@/lib/date";
import { ensureMonthlyCapSnapshot, monthStartOf } from "@/lib/monthly-cap";

const toNumber = (value: unknown) => Number(value ?? 0);
const normalizeCategoryName = (value: string) => value.trim().toLocaleLowerCase();

const fieldErrorResponse = (errors: Record<string, string>, status = 400) => {
  const firstError = Object.values(errors)[0] || "Validation failed.";
  return NextResponse.json({ error: firstError, errors }, { status });
};

export const GET = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ categories });
};

export const POST = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session?.sub) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.sub;

  const body = await request.json();
  const name = String(body.name || "").trim();
  const normalizedName = normalizeCategoryName(name);
  const icon = String(body.icon || "category").trim() || "category";
  const monthlyLimit = Number(body.monthlyLimit);
  const keepLimitNextMonth = body.keepLimitNextMonth !== false;
  const warningEnabled = body.warningEnabled !== false;
  const warnAt = Number(body.warnAt ?? 80);

  if (!name) {
    return fieldErrorResponse({ name: "Name is required." });
  }

  if (name.length > 50) {
    return fieldErrorResponse({ name: "Name must be 50 characters or fewer." });
  }

  if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
    return fieldErrorResponse({ monthlyLimit: "Monthly limit must be zero or greater." });
  }

  if (!Number.isFinite(warnAt) || warnAt < 1 || warnAt > 100) {
    return fieldErrorResponse({ warnAt: "Warn threshold must be between 1 and 100." });
  }

  const safeLimit = monthlyLimit;
  const now = nowDate();
  const monthStart = monthStartOf(now);
  const nextMonthStart = monthStartOf(addMonthsDate(now, 1));

  const [currentCap, nextCap, currentMonthLimits, nextMonthLimits, existingCategories] = await Promise.all([
    ensureMonthlyCapSnapshot(userId, monthStart),
    ensureMonthlyCapSnapshot(userId, nextMonthStart),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart },
      select: { limit: true },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart: nextMonthStart },
      select: { limit: true },
    }),
    prisma.category.findMany({
      where: { userId },
      select: { name: true },
    }),
  ]);

  const duplicateNameExists = existingCategories.some((category) => {
    return normalizeCategoryName(category.name) === normalizedName;
  });

  if (duplicateNameExists) {
    return fieldErrorResponse({ name: "Category name already exists." });
  }

  const currentAllocated = currentMonthLimits.reduce((sum, row) => sum + toNumber(row.limit), 0);
  const projectedCurrentAllocated = currentAllocated + safeLimit;
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
  const nextLimitValue = keepLimitNextMonth ? safeLimit : 0;
  const projectedNextAllocated = nextAllocated + nextLimitValue;
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
    const created = await tx.category.create({
      data: {
        userId,
        name,
        icon,
      },
    });

    await tx.categoryMonthlyLimit.create({
      data: {
        userId,
        categoryId: created.id,
        monthStart,
        limit: safeLimit,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
    });

    await tx.categoryMonthlyLimit.upsert({
      where: {
        userId_categoryId_monthStart: {
          userId,
          categoryId: created.id,
          monthStart: nextMonthStart,
        },
      },
      create: {
        userId,
        categoryId: created.id,
        monthStart: nextMonthStart,
        limit: keepLimitNextMonth ? safeLimit : 0,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
      update: {
        limit: keepLimitNextMonth ? safeLimit : 0,
        warningEnabled,
        warnAt: Math.round(warnAt),
      },
    });

    return created;
  });

  await Promise.all([
    ensureMonthlyCapSnapshot(userId, monthStart),
    ensureMonthlyCapSnapshot(userId, nextMonthStart),
  ]);

  return NextResponse.json({ category });
};
