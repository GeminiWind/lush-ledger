import { prisma } from "@/lib/db";
import { DEFAULT_TIMEZONE, dayOfMonth, daysUntil, getMonthRange, nowDate, resolveMonthRangeFromQuery } from "@/lib/date";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";
import type { AtelierListRiskStatus, AtelierListRow } from "@/features/atelier/types";

const toNumber = (value: unknown) => Number(value ?? 0);

const sum = (items: number[]) => items.reduce((total, value) => total + value, 0);

const DEFAULT_WARN_AT_PERCENT = 80;
const DEFAULT_WARNING_ENABLED = true;
const DEFAULT_ICON = "category";

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

const normalizeWarnAt = (value: unknown) => {
  const parsed = Number(value ?? DEFAULT_WARN_AT_PERCENT);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_WARN_AT_PERCENT;
  }
  return Math.min(Math.max(Math.round(parsed), 1), 100);
};

export type AtelierListRowMapperInput = {
  id: string;
  name: string;
  icon?: string | null;
  limit?: unknown;
  spent?: unknown;
  warningEnabled?: boolean;
  warnAt?: number;
  carryNextMonth?: boolean;
  status?: AtelierListRiskStatus;
  hasCompleteData?: boolean;
};

export const evaluateAtelierListRowStatus = ({
  limit,
  spent,
  warningEnabled,
  warnAt,
  hasCompleteData,
}: {
  limit: number;
  spent: number;
  warningEnabled: boolean;
  warnAt: number;
  hasCompleteData: boolean;
}): AtelierListRiskStatus => {
  if (!hasCompleteData) {
    return "pending";
  }

  if (spent > limit) {
    return "overspent";
  }

  if (warningEnabled && limit > 0 && spent >= (limit * warnAt) / 100) {
    return "warning";
  }

  return "healthy";
};

export const mapAtelierListRow = (input: AtelierListRowMapperInput): AtelierListRow => {
  const limit = Math.max(0, toNumber(input.limit));
  const spent = Math.max(0, toNumber(input.spent));
  const warningEnabled = input.warningEnabled ?? DEFAULT_WARNING_ENABLED;
  const warnAt = normalizeWarnAt(input.warnAt);
  const usagePercent = limit > 0 ? clampPercent((spent / limit) * 100) : spent > 0 ? 100 : 0;

  return {
    id: input.id,
    name: input.name,
    icon: input.icon || DEFAULT_ICON,
    limit,
    spent,
    usagePercent,
    warningEnabled,
    warnAt,
    carryNextMonth: input.carryNextMonth ?? false,
    status:
      input.status ||
      evaluateAtelierListRowStatus({
        limit,
        spent,
        warningEnabled,
        warnAt,
        hasCompleteData: input.hasCompleteData ?? true,
      }),
  };
};

type GetAtelierListDataInput = {
  month?: string | null;
};

export const getAtelierListData = async (userId: string, input: GetAtelierListDataInput = {}) => {
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
    month: input.month,
    timezone: user?.settings?.timezone,
    fallbackTimezone: DEFAULT_TIMEZONE,
  });

  if (!resolvedMonth.ok) {
    throw new Error(resolvedMonth.errors.month);
  }

  const [categories, currentMonthLimits, nextMonthLimits, monthTransactions] = await Promise.all([
    prisma.category.findMany({
      where: { userId },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      select: { id: true, name: true, icon: true },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart: resolvedMonth.start },
      select: {
        categoryId: true,
        limit: true,
        warningEnabled: true,
        warnAt: true,
      },
    }),
    prisma.categoryMonthlyLimit.findMany({
      where: { userId, monthStart: resolvedMonth.nextMonthStart },
      select: {
        categoryId: true,
        limit: true,
      },
    }),
    prisma.transaction.findMany({
      where: {
        userId,
        type: "expense",
        date: {
          gte: resolvedMonth.start,
          lte: resolvedMonth.end,
        },
      },
      select: {
        categoryId: true,
        amount: true,
      },
    }),
  ]);

  const currentLimitByCategoryId = new Map(currentMonthLimits.map((item) => [item.categoryId, item]));
  const nextLimitByCategoryId = new Map(
    nextMonthLimits.map((item) => [item.categoryId, toNumber(item.limit)]),
  );

  const spentByCategoryId = new Map<string, number>();
  for (const transaction of monthTransactions) {
    if (!transaction.categoryId) {
      continue;
    }
    spentByCategoryId.set(
      transaction.categoryId,
      (spentByCategoryId.get(transaction.categoryId) || 0) + toNumber(transaction.amount),
    );
  }

  const categoriesRows = categories.map((category) => {
    const currentLimit = currentLimitByCategoryId.get(category.id);
    const selectedLimit = currentLimit ? toNumber(currentLimit.limit) : 0;
    const hasIncompleteSnapshot =
      Boolean(currentLimit) &&
      (typeof currentLimit?.warningEnabled !== "boolean" ||
        !Number.isFinite(Number(currentLimit?.warnAt)) ||
        Number(currentLimit?.warnAt) < 1 ||
        Number(currentLimit?.warnAt) > 100 ||
        !Number.isFinite(Number(currentLimit?.limit)));

    const carryNextMonth = currentLimit
      ? nextLimitByCategoryId.has(category.id) && nextLimitByCategoryId.get(category.id) === selectedLimit
      : false;

    return mapAtelierListRow({
      id: category.id,
      name: category.name,
      icon: category.icon,
      limit: selectedLimit,
      spent: spentByCategoryId.get(category.id) || 0,
      warningEnabled: currentLimit?.warningEnabled ?? true,
      warnAt: currentLimit?.warnAt ?? DEFAULT_WARN_AT_PERCENT,
      carryNextMonth,
      hasCompleteData: !hasIncompleteSnapshot,
    });
  });

  return {
    month: resolvedMonth.month,
    categories: categoriesRows,
  };
};

export const getAtelierData = async (userId: string) => {
  const now = nowDate();
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

  const daysPassed = Math.max(1, dayOfMonth(now));
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
          .filter((tx) => tx.savingsPlanId === plan.id)
          .map((tx) => {
            const amount = toNumber(tx.amount);
            return tx.type === "refund" || tx.type === "expense" ? -amount : amount;
          })
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
