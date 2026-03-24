import { prisma } from "@/lib/db";

const toNumber = (value: unknown) => Number(value ?? 0);

export const monthStartOf = (value: Date) => new Date(value.getFullYear(), value.getMonth(), 1);

export const monthKeyOf = (value: Date) => {
  const monthStart = monthStartOf(value);
  return `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;
};

export const ensureMonthlyCapSnapshot = async (userId: string, rawDate: Date, fallbackBackup = 0) => {
  const monthStart = monthStartOf(rawDate);

  const [categories, existingLimits, existingCap] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      select: { id: true, monthlyLimit: true },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart },
      select: { categoryId: true, limit: true },
    }),
    prisma.userMonthlyCap.findUnique({
      where: { userId_monthStart: { userId, monthStart } },
    }),
  ]);

  const existingCategoryIds = new Set(existingLimits.map((item) => item.categoryId));
  const missingLimits = categories
    .filter((category) => !existingCategoryIds.has(category.id))
    .map((category) => ({
      userId,
      categoryId: category.id,
      monthStart,
      limit: toNumber(category.monthlyLimit),
    }));

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
  const baseCap = existingCap ? toNumber(existingCap.totalCap) : totalLimit + Math.max(toNumber(fallbackBackup), 0);
  const totalCap = Math.max(baseCap, totalLimit);
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
