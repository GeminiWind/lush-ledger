export type MonthlyPoint = {
  key: string;
  income: number;
  expense: number;
  outcome: number;
  budget: number;
};

export type YearlyPoint = {
  key: string;
  income: number;
  expense: number;
  outcome: number;
  budget: number;
};

export type ExpenseEntry = {
  id: string;
  type: string;
  amount: number;
  dateISO: string;
  categoryId: string | null;
  categoryName: string | null;
};

export type ReportsData = {
  summary: {
    totalExpense: number;
    budgetAdherence: number;
    topSavingsAmount: number;
    budget: number;
  };
  monthlySeries: MonthlyPoint[];
  yearlySeries: YearlyPoint[];
  expenseEntries: ExpenseEntry[];
  bounds: {
    firstMonthKey: string;
    lastMonthKey: string;
    firstYear: number;
    lastYear: number;
  };
};

export const parseMonthKey = (key: string) => {
  const [yearPart, monthPart] = key.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  return {
    year: Number.isFinite(year) ? year : 0,
    month: Number.isFinite(month) ? month : 1,
  };
};

export const monthRank = (key: string) => {
  const { year, month } = parseMonthKey(key);
  return year * 12 + month;
};

export const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

export const formatMonthLabel = (monthKeyValue: string, language: string, style: "short" | "long" = "short") => {
  const { year, month } = parseMonthKey(monthKeyValue);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(language === "vi-VN" ? "vi-VN" : "en-US", {
    month: style,
    year: style === "long" ? "numeric" : undefined,
  }).format(date);
};
