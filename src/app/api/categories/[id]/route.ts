import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import { DEFAULT_TIMEZONE, nowDate, resolveMonthRangeFromQuery } from "@/lib/date";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

const toNumber = (value: unknown) => Number(value ?? 0);
const normalizeCategoryName = (value: string) => value.trim().toLocaleLowerCase();

type PatchFieldErrors = Partial<Record<"name" | "monthlyLimit" | "warnAt" | "month", string>>;

const patchFieldErrorResponse = (errors: PatchFieldErrors, status = 400) => {
  const firstError = Object.values(errors)[0] || "Validation failed.";
  return NextResponse.json({ error: firstError, errors }, { status });
};

type CategoryLookupClient = {
  category: {
    findMany: typeof prisma.category.findMany;
  };
};

const findCategoryNameConflict = async (
  client: CategoryLookupClient,
  userId: string,
  categoryId: string,
  normalizedName: string,
) => {
  const categories = await client.category.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  return categories.find((category) => {
    if (category.id === categoryId) {
      return false;
    }

    return normalizeCategoryName(category.name) === normalizedName;
  });
};

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
  const normalizedName = normalizeCategoryName(name);
  const icon = String(body.icon || "category").trim() || "category";
  const monthlyLimit = Number(body.monthlyLimit);
  const warningEnabled = body.warningEnabled !== false;
  const warnAt = Number(body.warnAt ?? 80);
  const keepLimitNextMonth = body.keepLimitNextMonth !== false;

  if (!name) {
    return patchFieldErrorResponse({ name: "Name is required." });
  }

  if (name.length > 50) {
    return patchFieldErrorResponse({ name: "Name must be 50 characters or fewer." });
  }

  if (!Number.isFinite(monthlyLimit) || monthlyLimit <= 0) {
    return patchFieldErrorResponse({ monthlyLimit: "Monthly limit must be greater than zero." });
  }

  if (warningEnabled && (!Number.isInteger(warnAt) || warnAt < 1 || warnAt > 100)) {
    return patchFieldErrorResponse({ warnAt: "Warn threshold must be an integer from 1 to 100." });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      settings: {
        select: {
          timezone: true,
        },
      },
    },
  });

  const resolvedMonth = resolveMonthRangeFromQuery({
    month: request.nextUrl.searchParams.get("month"),
    timezone: user?.settings?.timezone,
    fallbackTimezone: DEFAULT_TIMEZONE,
    now: nowDate(),
  });

  if (!resolvedMonth.ok) {
    return patchFieldErrorResponse({ month: resolvedMonth.errors.month });
  }

  const currentMonth = resolvedMonth.start;
  const nextMonth = resolvedMonth.nextMonthStart;

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
      select: { limit: true, warningEnabled: true, warnAt: true },
    }),
    prisma.categoryMonthlyLimit.findUnique({
      where: {
        userId_categoryId_monthStart: {
          userId,
          categoryId: id,
          monthStart: nextMonth,
        },
      },
      select: { limit: true, warningEnabled: true, warnAt: true },
    }),
  ]);

  const currentAllocated = currentMonthLimits.reduce((sum, row) => sum + toNumber(row.limit), 0);
  const currentExisting = toNumber(currentExistingLimit?.limit);
  const projectedCurrentAllocated = currentAllocated - currentExisting + monthlyLimit;
  const currentCapValue = toNumber(currentCap.totalCap);

  if (projectedCurrentAllocated > currentCapValue) {
    const overBy = projectedCurrentAllocated - currentCapValue;
    return patchFieldErrorResponse(
      {
        monthlyLimit: `Category limits exceed monthly cap by ${overBy}. Increase monthly cap or lower category limit.`,
      },
      400,
    );
  }

  const nextAllocated = nextMonthLimits.reduce((sum, row) => sum + toNumber(row.limit), 0);
  const nextExisting = toNumber(nextExistingLimit?.limit);
  const nextLimitValue = keepLimitNextMonth ? monthlyLimit : 0;
  const projectedNextAllocated = nextAllocated - nextExisting + nextLimitValue;
  const nextCapValue = toNumber(nextCap.totalCap);
  const preservedWarnAt = toNumber(currentExistingLimit?.warnAt ?? nextExistingLimit?.warnAt ?? 80);
  const resolvedWarnAt = warningEnabled ? Math.round(warnAt) : Math.round(preservedWarnAt);

  if (projectedNextAllocated > nextCapValue) {
    const overBy = projectedNextAllocated - nextCapValue;
    return patchFieldErrorResponse(
      {
        monthlyLimit: `Next month category limits exceed monthly cap by ${overBy}. Increase next month cap or disable keep limit next month.`,
      },
      400,
    );
  }

  const category = await prisma.$transaction(async (tx) => {
    const existing = await tx.category.findFirst({
      where: { id, userId },
      select: { id: true, name: true, icon: true },
    });

    if (!existing) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    const duplicateCategory = await findCategoryNameConflict(tx, userId, existing.id, normalizedName);
    if (duplicateCategory) {
      throw new Error("CATEGORY_DUPLICATE_NAME");
    }

    const updated = await tx.category.update({
      where: { id: existing.id },
      data: { name, icon },
      select: { id: true, name: true, icon: true },
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
        warnAt: resolvedWarnAt,
      },
      update: {
        limit: monthlyLimit,
        warningEnabled,
        warnAt: resolvedWarnAt,
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
        warnAt: resolvedWarnAt,
      },
      update: {
        limit: keepLimitNextMonth ? monthlyLimit : 0,
        warningEnabled,
        warnAt: resolvedWarnAt,
      },
    });

    return updated;
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return null;
    }

    if (error instanceof Error && error.message === "CATEGORY_DUPLICATE_NAME") {
      return "CATEGORY_DUPLICATE_NAME";
    }

    throw error;
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  if (category === "CATEGORY_DUPLICATE_NAME") {
    return patchFieldErrorResponse({ name: "Category name already exists." });
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

  await ensureMonthlyCapSnapshot(userId, nowDate());

  return NextResponse.json({ ok: true });
};
