import type { Prisma } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db";
import { fromISODate, toISODate } from "@/lib/date";
import { materializeRecurringTransactions } from "@/lib/recurring";

type LedgerExportType = "income" | "expense" | "transfer_to_saving_plan" | "refund";

export type LedgerExportQuery = {
  query?: string;
  type?: LedgerExportType;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

export type LedgerExportRow = {
  transactionDate: string;
  account: string;
  category: string;
  transactionType: string;
  description: string;
  amount: string;
  currency: string;
};

export const LEDGER_EXPORT_HEADERS = [
  "transaction_date",
  "account",
  "category",
  "transaction_type",
  "description",
  "amount",
  "currency",
] as const;

const VALID_TYPES = new Set<LedgerExportType>(["income", "expense", "transfer_to_saving_plan", "refund"]);

export class LedgerExportValidationError extends Error {}

const normalize = (value: string | null) => {
  const trimmed = (value || "").trim();
  return trimmed || undefined;
};

export const parseLedgerExportQuery = (searchParams: URLSearchParams): LedgerExportQuery => {
  const query = normalize(searchParams.get("query"));
  const type = normalize(searchParams.get("type"));
  const accountId = normalize(searchParams.get("accountId"));
  const categoryId = normalize(searchParams.get("categoryId"));
  const startDate = normalize(searchParams.get("startDate"));
  const endDate = normalize(searchParams.get("endDate"));

  if (type && !VALID_TYPES.has(type as LedgerExportType)) {
    throw new LedgerExportValidationError("Invalid transaction type.");
  }

  if (startDate && !fromISODate(startDate)) {
    throw new LedgerExportValidationError("Invalid start date.");
  }

  if (endDate && !fromISODate(endDate)) {
    throw new LedgerExportValidationError("Invalid end date.");
  }

  if (startDate && endDate) {
    const start = fromISODate(startDate);
    const end = fromISODate(endDate);
    if (start && end && start.getTime() > end.getTime()) {
      throw new LedgerExportValidationError("Start date must be before or equal to end date.");
    }
  }

  return {
    query,
    type: type as LedgerExportType | undefined,
    accountId,
    categoryId,
    startDate,
    endDate,
  };
};

const toWhere = (userId: string, query: LedgerExportQuery): Prisma.TransactionWhereInput => {
  const where: Prisma.TransactionWhereInput = { userId };

  if (query.type) {
    where.type = query.type;
  }
  if (query.accountId) {
    where.accountId = query.accountId;
  }
  if (query.categoryId) {
    where.categoryId = query.categoryId;
  }
  if (query.query) {
    where.notes = { contains: query.query };
  }

  if (query.startDate || query.endDate) {
    const date: Prisma.DateTimeFilter = {};
    if (query.startDate) {
      const start = fromISODate(query.startDate);
      if (start) {
        date.gte = start;
      }
    }
    if (query.endDate) {
      date.lte = DateTime.fromISO(query.endDate).endOf("day").toJSDate();
    }
    where.date = date;
  }

  return where;
};

export const getLedgerExportRows = async (userId: string, query: LedgerExportQuery): Promise<LedgerExportRow[]> => {
  await materializeRecurringTransactions(userId);

  if (query.accountId) {
    const account = await prisma.account.findFirst({
      where: { id: query.accountId, userId },
      select: { id: true },
    });
    if (!account) {
      throw new LedgerExportValidationError("Invalid account filter.");
    }
  }

  if (query.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: query.categoryId, userId },
      select: { id: true },
    });
    if (!category) {
      throw new LedgerExportValidationError("Invalid category filter.");
    }
  }

  const [transactions, settings] = await Promise.all([
    prisma.transaction.findMany({
      where: toWhere(userId, query),
      include: {
        account: { select: { name: true } },
        category: { select: { name: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.userSettings.findUnique({
      where: { userId },
      select: { currency: true },
    }),
  ]);

  const currency = settings?.currency || "VND";

  return transactions.map((transaction) => ({
    transactionDate: toISODate(transaction.date),
    account: transaction.account.name,
    category: transaction.category?.name || "",
    transactionType: transaction.type,
    description: transaction.notes || "",
    amount: transaction.amount.toString(),
    currency,
  }));
};

const escapeCsvValue = (value: string) => {
  if (/[,"\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
};

export const serializeLedgerExportCsv = (rows: LedgerExportRow[]) => {
  const lines = [LEDGER_EXPORT_HEADERS.join(",")];

  for (const row of rows) {
    lines.push(
      [
        row.transactionDate,
        row.account,
        row.category,
        row.transactionType,
        row.description,
        row.amount,
        row.currency,
      ]
        .map((value) => escapeCsvValue(value))
        .join(","),
    );
  }

  return lines.join("\n");
};

export const buildLedgerExportFileName = (now: Date = new Date()) => {
  const date = toISODate(now) || "export";
  return `ledger-transactions-${date}.csv`;
};
