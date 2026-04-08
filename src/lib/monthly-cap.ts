import { prisma } from "@/lib/db";
import { monthKey, startOfMonthDate } from "@/lib/date";

const toNumber = (value: unknown) => Number(value ?? 0);

const isReadonlyDatabaseError = (error: unknown) => {
  if (!(error instanceof Error)) {
    return false;
  }

  return /readonly database/i.test(error.message);
};

type MonthlyCapSnapshot = {
  userId: string;
  monthStart: Date;
  totalLimit: number;
  totalCap: number;
  unallocatedBackup: number;
};

export type MonthlyAllocationEligibility = {
  monthStart: Date;
  totalCap: number;
  totalLimit: number;
  isVisible: boolean;
  reason: string;
};

export const monthStartOf = (value: Date) => startOfMonthDate(value);

export const monthKeyOf = (value: Date) => {
  return monthKey(monthStartOf(value));
};

export const isRemainderAllocationVisible = (values: {
  totalCap: unknown;
  totalLimit: unknown;
}) => {
  return toNumber(values.totalLimit) < toNumber(values.totalCap);
};

export const ensureMonthlyCapSnapshot = async (
  userId: string,
  rawDate: Date,
  fallbackBackup = 0,
): Promise<MonthlyCapSnapshot> => {
  const monthStart = monthStartOf(rawDate);

  const [categories, existingLimits, latestLimitRows, existingCap] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      select: { id: true },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart },
      select: { categoryId: true, limit: true, warningEnabled: true, warnAt: true },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart: { lt: monthStart } },
      orderBy: [{ categoryId: "asc" }, { monthStart: "desc" }],
      select: { categoryId: true, limit: true, warningEnabled: true, warnAt: true },
    }),
    prisma.userMonthlyCap.findUnique({
      where: { userId_monthStart: { userId, monthStart } },
    }),
  ]);

  const latestByCategory = new Map<string, { limit: number; warningEnabled: boolean; warnAt: number }>();
  for (const row of latestLimitRows) {
    if (!latestByCategory.has(row.categoryId)) {
      latestByCategory.set(row.categoryId, {
        limit: toNumber(row.limit),
        warningEnabled: row.warningEnabled,
        warnAt: row.warnAt,
      });
    }
  }

  const existingCategoryIds = new Set(existingLimits.map((item) => item.categoryId));
  const missingLimits = categories
    .filter((category) => !existingCategoryIds.has(category.id))
    .map((category) => {
      const latest = latestByCategory.get(category.id);
      return {
        userId,
        categoryId: category.id,
        monthStart,
        limit: latest?.limit ?? 0,
        warningEnabled: latest?.warningEnabled ?? true,
        warnAt: latest?.warnAt ?? 80,
      };
    });

  let createdMissingLimits = false;
  if (missingLimits.length > 0) {
    try {
      await prisma.categoryMonthlyLimit.createMany({ data: missingLimits });
      createdMissingLimits = true;
    } catch (error) {
      if (!isReadonlyDatabaseError(error)) {
        throw error;
      }
    }
  }

  const allLimits =
    createdMissingLimits
      ? await prisma.categoryMonthlyLimit.findMany({
          where: { userId, monthStart },
          select: { limit: true },
        })
      : [
          ...existingLimits,
          ...missingLimits.map((item) => ({
            limit: item.limit,
            categoryId: item.categoryId,
            warningEnabled: item.warningEnabled,
            warnAt: item.warnAt,
          })),
        ];

  const totalLimit = allLimits.reduce((sum, item) => sum + toNumber(item.limit), 0);
  const totalCap = existingCap ? toNumber(existingCap.totalCap) : totalLimit + Math.max(toNumber(fallbackBackup), 0);
  const unallocatedBackup = Math.max(totalCap - totalLimit, 0);

  try {
    const monthlyCap = await prisma.userMonthlyCap.upsert({
      where: { userId_monthStart: { userId, monthStart } },
      create: {
        userId,
        monthStart,
        totalLimit,
        totalCap,
        unallocatedBackup,
      },
      update: {
        totalLimit,
        totalCap,
        unallocatedBackup,
      },
    });

    return {
      userId: monthlyCap.userId,
      monthStart: monthlyCap.monthStart,
      totalLimit: toNumber(monthlyCap.totalLimit),
      totalCap: toNumber(monthlyCap.totalCap),
      unallocatedBackup: toNumber(monthlyCap.unallocatedBackup),
    };
  } catch (error) {
    if (!isReadonlyDatabaseError(error)) {
      throw error;
    }

    return {
      userId,
      monthStart,
      totalLimit,
      totalCap,
      unallocatedBackup,
    };
  }
};

export const getMonthlyAllocationEligibility = async (
  userId: string,
  rawDate: Date,
): Promise<MonthlyAllocationEligibility> => {
  const snapshot = await ensureMonthlyCapSnapshot(userId, rawDate);
  const totalCap = toNumber(snapshot.totalCap);
  const totalLimit = toNumber(snapshot.totalLimit);
  const isVisible = isRemainderAllocationVisible({ totalCap, totalLimit });

  return {
    monthStart: snapshot.monthStart,
    totalCap,
    totalLimit,
    isVisible,
    reason: isVisible
      ? "eligible_cap_above_limits"
      : "ineligible_cap_not_above_limits",
  };
};
