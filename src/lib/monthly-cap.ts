import { prisma } from "@/lib/db";
import { monthKey, startOfMonthDate } from "@/lib/date";

const toNumber = (value: unknown) => Number(value ?? 0);

export const monthStartOf = (value: Date) => startOfMonthDate(value);

export const monthKeyOf = (value: Date) => {
  return monthKey(monthStartOf(value));
};

export const ensureMonthlyCapSnapshot = async (userId: string, rawDate: Date, fallbackBackup = 0) => {
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

  if (missingLimits.length > 0) {
    await prisma.categoryMonthlyLimit.createMany({ data: missingLimits });
  }

  const allLimits =
    missingLimits.length > 0
      ? await prisma.categoryMonthlyLimit.findMany({
          where: { userId, monthStart },
          select: { limit: true },
        })
      : existingLimits;

  const totalLimit = allLimits.reduce((sum, item) => sum + toNumber(item.limit), 0);
  const totalCap = existingCap ? toNumber(existingCap.totalCap) : totalLimit + Math.max(toNumber(fallbackBackup), 0);
  const unallocatedBackup = Math.max(totalCap - totalLimit, 0);

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

  return monthlyCap;
};
