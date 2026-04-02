export type LedgerEntryType = "income" | "expense" | "transfer_to_saving_plan" | "refund";

import type { ExpenseEntry, ReportsData } from "@/features/ledger/components/reports/report-utils";

export type LedgerJsonRecord = Record<string, unknown>;

export type LedgerOption = {
  id: string;
  name: string;
};

export type NewEntryFormProps = {
  wallets: LedgerOption[];
  defaultWalletId: string;
  categories: LedgerOption[];
};

export type NewEntryFormValues = {
  type: "expense" | "income";
  amountDisplay: string;
  categoryId: string;
  walletId: string;
  date: Date | null;
  isRecurring: boolean;
  recurringInterval: "monthly" | "yearly";
  recurringDayOfMonth: string;
  recurringEndDate: Date | null;
  description: string;
  note: string;
};

export type NewEntryFormErrors = Partial<Record<keyof NewEntryFormValues, string>>;

export type LedgerEntryFormProps = {
  accounts: LedgerOption[];
  categories: LedgerOption[];
  currency?: string;
};

export type LedgerEntryMutationValues = {
  accountId: string;
  categoryId: string;
  type: string;
  amount: string;
  date: string;
  notes: string;
};

export type EditTransactionFormProps = {
  transactionId: string;
  language: string;
  currency: string;
  categories: LedgerOption[];
  initialAmount: number;
  initialCategoryId: string;
  initialDate: string;
  initialDescription: string;
  initialNote: string;
};

export type EditTransactionFormValues = {
  amountDisplay: string;
  categoryId: string;
  date: string;
  description: string;
  note: string;
};

export type DeleteTransactionDialogTransaction = {
  id: string;
  type: string;
  amount: number;
  notes: string | null;
  date: string;
  accountName: string;
  categoryName: string | null;
  icon: string;
};

export type DeleteTransactionDialogProps = {
  language: string;
  currency: string;
  transaction: DeleteTransactionDialogTransaction;
};

export type ReportsViewMode = "monthly" | "yearly";

export type ReportsViewProps = {
  language: string;
  currency: string;
  data: ReportsData;
};

export type DailyCalendarLabels = {
  title: string;
  weekdays: string[];
  detailsTitle: string;
  totalSpent: string;
  closeView: string;
  noExpenseData: string;
  fallbackTransaction: string;
};

export type DailyCalendarProps = {
  language: string;
  currency: string;
  monthOptions: string[];
  expenseEntries: ExpenseEntry[];
  labels: DailyCalendarLabels;
};

export type ReportCategoryRow = {
  name: string;
  value: number;
  color: string;
};

export type CategoryChartProps = {
  rows: ReportCategoryRow[];
  currency: string;
  title: string;
  totalLabel: string;
  noDataLabel: string;
};

export type CashflowRow = { label: string; income: number; outcome: number };

export type CashflowChartProps = {
  rows: CashflowRow[];
  currency: string;
  title: string;
  incomeLabel: string;
  outcomeLabel: string;
};

export type ExpenseBudgetRow = { label: string; expense: number; budget: number };

export type ExpenseBudgetChartProps = {
  rows: ExpenseBudgetRow[];
  currency: string;
  title: string;
  actualLabel: string;
  budgetLabel: string;
};
