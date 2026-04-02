import { prisma } from "@/lib/db";
import { addMonthsDate, getMonthRange, monthKey, nowDate, startOfMonthDate } from "@/lib/date";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";
import { materializeRecurringTransactions } from "@/lib/recurring";

type LedgerFilters = {
  query?: string;
  type?: string;
  accountId?: string;
  categoryId?: string;
};

type LedgerTxType = "income" | "expense" | "transfer_to_saving_plan" | "refund";

const toNumber = (value: unknown) => Number(value ?? 0);

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const getLedgerData = async (userId: string, filters: LedgerFilters = {}) => {
  await materializeRecurringTransactions(userId);

  const { start, end } = getMonthRange(nowDate());

  const where: {
    userId: string;
    type?: LedgerTxType;
    accountId?: string;
    categoryId?: string;
    notes?: { contains: string };
  } = { userId };

  if (filters.type === "income" || filters.type === "expense" || filters.type === "transfer_to_saving_plan" || filters.type === "refund") {
    where.type = filters.type;
  }
  if (filters.accountId) {
    where.accountId = filters.accountId;
  }
  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }
  if (filters.query) {
    where.notes = { contains: filters.query.trim() };
  }

  const [accounts, categories, transactions, monthTransactions] = await Promise.all([
    prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where,
        include: {
          account: { select: { name: true } },
          category: { select: { name: true, icon: true } },
          savingsPlan: { select: { name: true } },
        },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 30,
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
    }),
  ]);

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

  return {
    accounts,
    categories,
    transactions,
    summary: {
      monthIncome,
      monthExpense,
      monthNet: monthIncome - monthExpense,
      transactionCount: transactions.length,
    },
  };
};

type ReportRangeTx = {
  id: string;
  type: string;
  amount: number;
  dateISO: string;
  categoryId: string | null;
  categoryName: string | null;
};

const parseMonthKey = (key: string) => {
  const [yearPart, monthPart] = key.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return { year: 0, month: 1 };
  }

  return { year, month };
};

export const getLedgerReportsData = async (userId: string) => {
  await materializeRecurringTransactions(userId);

  const now = nowDate();
  const currentMonthStart = startOfMonthDate(now);
  await ensureMonthlyCapSnapshot(userId, currentMonthStart);

  const [transactions, monthlyCaps] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, isRecurringTemplate: false },
      select: {
        id: true,
        type: true,
        amount: true,
        date: true,
        notes: true,
        categoryId: true,
        category: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    }),
    prisma.userMonthlyCap.findMany({
      where: { userId },
      select: { monthStart: true, totalCap: true },
      orderBy: { monthStart: "asc" },
    }),
  ]);

  const capByMonth = new Map(
    monthlyCaps.map((cap) => [monthKey(cap.monthStart), toNumber(cap.totalCap)]),
  );

  const monthAggregates = new Map<string, { income: number; expense: number; outcome: number }>();
  const expenseEntries: ReportRangeTx[] = [];

  for (const tx of transactions) {
    const amount = toNumber(tx.amount);
    const key = monthKey(tx.date);
    const current = monthAggregates.get(key) ?? { income: 0, expense: 0, outcome: 0 };

    if (tx.type === "income" || tx.type === "refund") {
      current.income += amount;
    }

    if (tx.type === "expense") {
      current.expense += amount;
      current.outcome += amount;
      expenseEntries.push({
        id: tx.id,
        type: tx.type,
        amount,
        dateISO: tx.date.toISOString(),
        categoryId: tx.categoryId,
        categoryName: tx.category?.name || null,
      });
    }

    if (tx.type === "transfer_to_saving_plan") {
      current.outcome += amount;
    }

    monthAggregates.set(key, current);
  }

  const currentKey = monthKey(currentMonthStart);
  const firstObserved = [
    transactions[0]?.date,
    monthlyCaps[0]?.monthStart,
    currentMonthStart,
  ]
    .filter((value): value is Date => Boolean(value))
    .sort((a, b) => a.getTime() - b.getTime())[0] || currentMonthStart;

  const firstMonth = startOfMonthDate(firstObserved);
  const months: string[] = [];
  let cursor = firstMonth;
  let guard = 0;

  while (cursor <= currentMonthStart && guard < 600) {
    months.push(monthKey(cursor));
    cursor = startOfMonthDate(addMonthsDate(cursor, 1));
    guard += 1;
  }

  const monthlySeries = months.map((key) => {
    const aggregate = monthAggregates.get(key) ?? { income: 0, expense: 0, outcome: 0 };
    return {
      key,
      income: aggregate.income,
      expense: aggregate.expense,
      outcome: aggregate.outcome,
      budget: capByMonth.get(key) ?? 0,
    };
  });

  const yearlyBuckets = new Map<string, { income: number; expense: number; outcome: number; budget: number }>();
  for (const point of monthlySeries) {
    const { year } = parseMonthKey(point.key);
    const yearKey = String(year);
    const current = yearlyBuckets.get(yearKey) ?? { income: 0, expense: 0, outcome: 0, budget: 0 };
    current.income += point.income;
    current.expense += point.expense;
    current.outcome += point.outcome;
    current.budget += point.budget;
    yearlyBuckets.set(yearKey, current);
  }

  const yearlySeries = Array.from(yearlyBuckets.entries())
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, values]) => ({
      key: year,
      income: values.income,
      expense: values.expense,
      outcome: values.outcome,
      budget: values.budget,
    }));

  const currentMonth = monthlySeries.find((point) => point.key === currentKey) ?? {
    key: currentKey,
    income: 0,
    expense: 0,
    outcome: 0,
    budget: 0,
  };

  const currentMonthCategory = expenseEntries.reduce(
    (map, entry) => {
      if (!entry.dateISO.startsWith(currentKey)) {
        return map;
      }
      const label = entry.categoryName?.trim() || "Uncategorized";
      const value = map.get(label) ?? 0;
      map.set(label, value + entry.amount);
      return map;
    },
    new Map<string, number>(),
  );

  const topSavingsAmount =
    Array.from(currentMonthCategory.values()).sort((a, b) => b - a)[0] ?? 0;

  const budgetAdherence =
    currentMonth.budget > 0
      ? Number(((currentMonth.expense / currentMonth.budget) * 100).toFixed(1))
      : 0;

  return {
    summary: {
      totalExpense: currentMonth.expense,
      budgetAdherence,
      topSavingsAmount,
      budget: currentMonth.budget,
    },
    monthlySeries,
    yearlySeries,
    expenseEntries: expenseEntries.sort((a, b) => a.dateISO.localeCompare(b.dateISO)),
    bounds: {
      firstMonthKey: monthlySeries[0]?.key ?? currentKey,
      lastMonthKey: monthlySeries[monthlySeries.length - 1]?.key ?? currentKey,
      firstYear: Number(yearlySeries[0]?.key ?? parseMonthKey(currentKey).year),
      lastYear: Number(yearlySeries[yearlySeries.length - 1]?.key ?? parseMonthKey(currentKey).year),
    },
  };
};
