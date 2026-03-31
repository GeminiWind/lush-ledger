import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/date";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

const toNumber = (value: unknown) => Number(value ?? 0);

const sum = (items: number[]) => items.reduce((total, value) => total + value, 0);

const daysUntil = (date: Date, from: Date) => {
  const distance = date.getTime() - from.getTime();
  return Math.ceil(distance / 86400000);
};

export const getAtelierData = async (userId: string) => {
  const now = new Date();
  const { start, end } = getMonthRange(now);

  const [accounts, categories, savingsPlans, monthTransactions, monthCategoryLimits] = await Promise.all([
    prisma.account.findMany({ where: { userId } }),
    prisma.category.findMany({ where: { userId } }),
    prisma.savingsPlan.findMany({ where: { userId }, orderBy: { targetDate: "asc" } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: {
        category: { select: { name: true } },
        account: { select: { name: true, type: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    (async () => {
      await ensureMonthlyCapSnapshot(userId, start);
      return prisma.categoryMonthlyLimit.findMany({
        where: { userId, monthStart: start },
        select: { categoryId: true, limit: true },
      });
    })(),
  ]);

  const limitByCategoryId = new Map(
    monthCategoryLimits.map((item) => [item.categoryId, toNumber(item.limit)]),
  );

  const monthIncome = sum(
    monthTransactions
      .filter((tx) => tx.type === "income")
      .map((tx) => toNumber(tx.amount))
  );
  const monthExpense = sum(
    monthTransactions
      .filter((tx) => tx.type === "expense")
      .map((tx) => toNumber(tx.amount))
  );
  const net = monthIncome - monthExpense;

  const daysPassed = Math.max(1, now.getDate());
  const avgDailyExpense = monthExpense / daysPassed;

  const liquidBalance = sum(
    accounts
      .filter((account) => account.type !== "credit")
      .map((account) => toNumber(account.openingBalance))
  );
  const runwayDays = avgDailyExpense > 0 ? Math.floor(liquidBalance / avgDailyExpense) : 0;

  const categorySpending = categories
    .map((category) => {
      const spent = sum(
        monthTransactions
          .filter((tx) => tx.categoryId === category.id && tx.type === "expense")
          .map((tx) => toNumber(tx.amount))
      );
      const budget = limitByCategoryId.get(category.id) ?? 0;
      const utilization = budget > 0 ? (spent / budget) * 100 : 0;
      return {
        id: category.id,
        name: category.name,
        spent,
        budget,
        utilization,
      };
    })
    .filter((item) => item.spent > 0 || item.budget > 0)
    .sort((a, b) => b.spent - a.spent);

  const accountMix = accounts
    .map((account) => {
      const balance = toNumber(account.openingBalance);
      return {
        id: account.id,
        name: account.name,
        type: account.type,
        balance,
      };
    })
    .sort((a, b) => b.balance - a.balance);

  const totalMixBalance = Math.max(
    1,
    sum(accountMix.filter((item) => item.balance > 0).map((item) => item.balance))
  );

  const savingsMilestones = savingsPlans.slice(0, 3).map((plan) => {
      const allocated = sum(
        monthTransactions
          .filter((tx) => tx.savingsPlanId === plan.id && (tx.type === "income" || tx.type === "transfer_to_saving_plan"))
          .map((tx) => toNumber(tx.amount))
    );
    const target = toNumber(plan.targetAmount);
    const progress = target > 0 ? (allocated / target) * 100 : 0;

    return {
      id: plan.id,
      name: plan.name,
      target,
      allocated,
      progress,
      daysLeft: Math.max(0, daysUntil(plan.targetDate, now)),
      targetDate: plan.targetDate,
    };
  });

  return {
    monthIncome,
    monthExpense,
    net,
    avgDailyExpense,
    runwayDays,
    categorySpending: categorySpending.slice(0, 5),
    accountMix: accountMix.slice(0, 5).map((item) => ({
      ...item,
      ratio: item.balance > 0 ? (item.balance / totalMixBalance) * 100 : 0,
    })),
    savingsMilestones,
    recentTransactions: monthTransactions.slice(0, 6),
  };
};
