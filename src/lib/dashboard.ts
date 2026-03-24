import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/date";
import { materializeRecurringTransactions } from "@/lib/recurring";

type TxKind = "expense" | "income";

const toNumber = (value: unknown) => Number(value ?? 0);

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const sumByType = (
  values: Array<{ type: string; amount: unknown }>,
  type: TxKind
) => {
  return sum(
    values
      .filter((item) => item.type === type)
      .map((item) => toNumber(item.amount))
  );
};

const daysRemainingInMonth = (today: Date) => {
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return Math.max(0, Math.ceil((lastDay.getTime() - today.getTime()) / 86400000));
};

export const getDashboardData = async (userId: string) => {
  await materializeRecurringTransactions(userId);

  const now = new Date();
  const { start, end } = getMonthRange(now);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const { start: previousStart, end: previousEnd } = getMonthRange(previousMonthDate);

  const [accounts, categories, savingsPlans, allTransactions, monthTransactions, previousTransactions] =
    await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.savingsPlan.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId, date: { lte: end } },
        include: {
          account: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end } },
        include: { category: { select: { name: true } } },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: previousStart, lte: previousEnd } },
      }),
    ]);

  const accountBalances = accounts.map((account) => {
    const accountDelta = sum(
      allTransactions
        .filter((tx) => tx.accountId === account.id)
        .map((tx) => {
          const amount = toNumber(tx.amount);
          return tx.type === "expense" ? -amount : amount;
        })
    );

    return {
      id: account.id,
      type: account.type,
      name: account.name,
      balance: toNumber(account.openingBalance) + accountDelta,
    };
  });

  const assetsTotal = sum(
    accountBalances
      .filter((account) => account.type !== "credit")
      .map((account) => Math.max(0, account.balance))
  );
  const liabilitiesTotal = sum(
    accountBalances
      .filter((account) => account.type === "credit")
      .map((account) => Math.abs(Math.min(0, account.balance)) + Math.max(0, account.balance))
  );
  const netWorth = assetsTotal - liabilitiesTotal;

  const monthSpending = sumByType(monthTransactions, "expense");
  const previousSpending = sumByType(previousTransactions, "expense");
  const spendingDelta =
    previousSpending > 0
      ? ((monthSpending - previousSpending) / previousSpending) * 100
      : monthSpending > 0
        ? 100
        : 0;

  const monthlyLimit = sum(categories.map((category) => toNumber(category.monthlyLimit)));
  const monthlyUsedPercent = monthlyLimit > 0 ? (monthSpending / monthlyLimit) * 100 : 0;

  const categorySpendRows = categories
    .map((category) => {
      const spent = sum(
        monthTransactions
          .filter((tx) => tx.categoryId === category.id && tx.type === "expense")
          .map((tx) => toNumber(tx.amount))
      );

      return {
        id: category.id,
        name: category.name,
        spent,
        budget: toNumber(category.monthlyLimit),
      };
    })
    .filter((row) => row.spent > 0 || row.budget > 0)
    .sort((a, b) => b.spent - a.spent);

  const warning = categorySpendRows
    .filter((row) => row.budget > 0 && row.spent > row.budget)
    .sort((a, b) => b.spent - b.budget - (a.spent - a.budget))[0];

  const activeBudgets = categorySpendRows
    .filter((row) => row.budget > 0)
    .map((row) => {
      const remaining = row.budget - row.spent;
      return {
        ...row,
        remaining,
        isOverspent: remaining < 0,
      };
    });

  const topCategories = categorySpendRows.slice(0, 3);

  const savingsProgress = savingsPlans
    .map((plan) => {
      const saved = sum(
        allTransactions
          .filter((tx) => tx.savingsPlanId === plan.id && tx.type === "income")
          .map((tx) => toNumber(tx.amount))
      );
      const target = toNumber(plan.targetAmount);

      return {
        id: plan.id,
        name: plan.name,
        progress: target > 0 ? (saved / target) * 100 : 0,
      };
    })
    .sort((a, b) => b.progress - a.progress)[0];

  const recentEntries = allTransactions.slice(0, 3);

  const monthlySpendingTrend = Array.from({ length: 6 }, (_, index) => {
    const offset = 5 - index;
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const value = sum(
      allTransactions
        .filter((tx) => tx.type === "expense" && tx.date >= monthStart && tx.date <= monthEnd)
        .map((tx) => toNumber(tx.amount))
    );

    return {
      label: new Intl.DateTimeFormat("en-US", { month: "short" }).format(monthDate),
      value,
    };
  });

  return {
    netWorth,
    assetsTotal,
    liabilitiesTotal,
    monthSpending,
    monthlyLimit,
    monthlyUsedPercent,
    spendingDelta,
    warning,
    topCategories,
    activeBudgets,
    savingsProgress,
    recentEntries,
    monthlySpendingTrend,
    daysRemaining: daysRemainingInMonth(now),
  };
};
