import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/date";
import { materializeRecurringTransactions } from "@/lib/recurring";

type LedgerFilters = {
  query?: string;
  type?: string;
  accountId?: string;
  categoryId?: string;
};

const toNumber = (value: unknown) => Number(value ?? 0);

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

export const getLedgerData = async (userId: string, filters: LedgerFilters = {}) => {
  await materializeRecurringTransactions(userId);

  const { start, end } = getMonthRange(new Date());

  const where: {
    userId: string;
    type?: "income" | "expense";
    accountId?: string;
    categoryId?: string;
    notes?: { contains: string };
  } = { userId };

  if (filters.type === "income" || filters.type === "expense") {
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
