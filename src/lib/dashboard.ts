import { prisma } from "@/lib/db";
import { DateTime } from "luxon";
import { addMonthsDate, endOfMonthDate, getMonthRange, nowDate, startOfMonthDate } from "@/lib/date";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

type TxKind = "expense" | "income";
const isOutflowType = (type: string) => type === "expense" || type === "transfer_to_saving_plan";

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
  return Math.max(0, DateTime.fromJSDate(endOfMonthDate(today)).diff(DateTime.fromJSDate(today), "days").days);
};

export const getDashboardData = async (userId: string) => {
  await materializeRecurringTransactions(userId);

  const now = nowDate();
  const { start, end } = getMonthRange(now);
  const previousMonthDate = startOfMonthDate(addMonthsDate(now, -1));
  const { start: previousStart, end: previousEnd } = getMonthRange(previousMonthDate);

  const monthlyCap = await ensureMonthlyCapSnapshot(userId, start);

  const [accounts, categories, savingsPlans, allTransactions, monthTransactions, previousTransactions, monthCategoryLimits] =
    await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.savingsPlan.findMany({ where: { userId } }),
      prisma.transaction.findMany({
        where: { userId, date: { lte: end } },
        include: {
          account: { select: { name: true } },
          category: { select: { name: true, icon: true } },
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
      prisma.categoryMonthlyLimit.findMany({
        where: { userId, monthStart: start },
        select: { categoryId: true, limit: true },
      }),
    ]);

  const monthLimitByCategoryId = new Map(
    monthCategoryLimits.map((item) => [item.categoryId, toNumber(item.limit)]),
  );

  const accountBalances = accounts.map((account) => {
    const accountDelta = sum(
      allTransactions
        .filter((tx) => tx.accountId === account.id)
        .map((tx) => {
          const amount = toNumber(tx.amount);
          return isOutflowType(tx.type) ? -amount : amount;
        })
    );

    return {
      id: account.id,
      type: account.type,
      name: account.name,
      balance: toNumber(account.openingBalance) + accountDelta,
    };
  });

  const liquidAssetsTotal = sum(
    accountBalances
      .filter((account) => account.type !== "credit")
      .map((account) => Math.max(0, account.balance))
  );
  const liabilitiesTotal = sum(
    accountBalances
      .filter((account) => account.type === "credit")
      .map((account) => Math.abs(Math.min(0, account.balance)) + Math.max(0, account.balance))
  );
  const savingsAllocated = sum(
    allTransactions
      .filter((tx) => tx.savingsPlanId)
      .map((tx) => {
        const amount = toNumber(tx.amount);
        return tx.type === "refund" || tx.type === "expense" ? -amount : amount;
      })
  );

  const assetsTotal = liquidAssetsTotal + savingsAllocated;
  const netWorth = assetsTotal - liabilitiesTotal;

  const monthSpending = sumByType(monthTransactions, "expense");
  const previousSpending = sumByType(previousTransactions, "expense");
  const spendingDelta =
    previousSpending > 0
      ? ((monthSpending - previousSpending) / previousSpending) * 100
      : monthSpending > 0
        ? 100
        : 0;

  const monthlyLimit = toNumber(monthlyCap.totalCap);
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
        icon: category.icon,
        spent,
        budget: monthLimitByCategoryId.get(category.id) ?? 0,
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
          .filter((tx) => tx.savingsPlanId === plan.id)
          .map((tx) => {
            const amount = toNumber(tx.amount);
            return tx.type === "refund" || tx.type === "expense" ? -amount : amount;
          })
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
    const monthDate = startOfMonthDate(addMonthsDate(now, -offset));
    const monthStart = startOfMonthDate(monthDate);
    const monthEnd = endOfMonthDate(monthDate);
    const value = sum(
      allTransactions
        .filter((tx) => tx.type === "expense" && tx.date >= monthStart && tx.date <= monthEnd)
        .map((tx) => toNumber(tx.amount))
    );

    return {
      label: DateTime.fromJSDate(monthDate).setLocale("en-US").toLocaleString({ month: "short" }),
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
    daysRemaining: Math.max(0, Math.ceil(daysRemainingInMonth(now))),
  };
};
