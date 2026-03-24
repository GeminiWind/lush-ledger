import Link from "next/link";
import DailyExpenseCalendar from "@/app/app/ledger/reports/DailyExpenseCalendar";
import MonthlyExpenseBudgetChart from "@/app/app/ledger/reports/MonthlyExpenseBudgetChart";
import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/date";
import { tr } from "@/lib/i18n";
import { ensureMonthlyCapSnapshot, monthKeyOf } from "@/lib/monthly-cap";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { requireUser } from "@/lib/user";

const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const toNumber = (value: unknown) => Number(value ?? 0);

type SearchParams = Promise<{
  month?: string;
  year?: string;
}>;

const parseIntSafe = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default async function LedgerReportsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  await materializeRecurringTransactions(user.id);
  const language = user.settings?.language || "en-US";
  const locale = language === "vi-VN" ? "vi-VN" : "en-US";
  const currency = user.settings?.currency ?? "VND";
  const today = new Date();
  const params = await searchParams;
  const selectedYear = Math.min(2100, Math.max(2000, parseIntSafe(params.year, today.getFullYear())));
  const selectedMonth = Math.min(12, Math.max(1, parseIntSafe(params.month, today.getMonth() + 1)));
  const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
  const { start, end } = getMonthRange(selectedDate);

  const [monthCap, monthTransactions, recentTransactions] = await Promise.all([
    ensureMonthlyCapSnapshot(user.id, start),
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: start, lte: end } },
      include: {
        category: { select: { name: true } },
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: new Date(start.getFullYear(), start.getMonth() - 5, 1), lte: end },
      },
      orderBy: [{ date: "asc" }],
    }),
  ]);

  const totalExpense = monthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const monthIncome = monthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const totalBudget = toNumber(monthCap.totalLimit);
  const budgetAdherence = totalBudget > 0 ? Math.max(0, Math.min(100, (totalExpense / totalBudget) * 100)) : 0;
  const topSavings = Math.max(monthIncome - totalExpense, 0);

  const monthLabels = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() - (5 - index), 1);
    return {
      date,
      key: monthKey(date),
      label: date.toLocaleString(locale, { month: "short" }).toUpperCase(),
    };
  });

  const monthCaps = await Promise.all(monthLabels.map((month) => ensureMonthlyCapSnapshot(user.id, month.date)));
  const budgetByMonth = new Map<string, number>(
    monthCaps.map((cap) => [monthKeyOf(cap.monthStart), toNumber(cap.totalLimit)]),
  );

  const expenseByMonth = new Map<string, number>();
  for (const tx of recentTransactions) {
    if (tx.type !== "expense") {
      continue;
    }
    const key = monthKey(tx.date);
    expenseByMonth.set(key, (expenseByMonth.get(key) || 0) + toNumber(tx.amount));
  }

  const monthSeries = monthLabels.map((month) => ({
    ...month,
    expense: expenseByMonth.get(month.key) || 0,
    budget: budgetByMonth.get(month.key) || 0,
  }));
  const sortedExpenseDays = monthTransactions
    .filter((tx) => tx.type === "expense")
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const dayMap = new Map<
    string,
    {
      total: number;
      entries: { id: string; title: string; subtitle: string; amount: number }[];
    }
  >();

  for (const tx of sortedExpenseDays) {
    const key = tx.date.toISOString().slice(0, 10);
    if (!dayMap.has(key)) {
      dayMap.set(key, { total: 0, entries: [] });
    }
    const bucket = dayMap.get(key);
    if (!bucket) {
      continue;
    }
    const amount = toNumber(tx.amount);
    bucket.total += amount;
    bucket.entries.push({
      id: tx.id,
      title: tx.notes?.trim() || tx.category?.name || "Transaction",
      subtitle: `${tx.category?.name || "Uncategorized"} • ${tx.date.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      amount,
    });
  }

  const calendarStart = new Date(start);
  const weekday = (calendarStart.getDay() + 6) % 7;
  calendarStart.setDate(calendarStart.getDate() - weekday);

  const dailyTotals = Array.from(dayMap.values()).map((day) => day.total);
  const maxDailyTotal = Math.max(...dailyTotals, 1);

  const calendarDays = Array.from({ length: 42 }).map((_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    const source = dayMap.get(key);
    const total = source?.total || 0;
    const level = total > 0 ? Math.ceil((total / maxDailyTotal) * 5) : 0;

    return {
      key,
      day: date.getDate(),
      inMonth: date.getMonth() === start.getMonth(),
      total,
      level,
      entries: source?.entries || [],
    };
  });

  const monthLabel = selectedDate.toLocaleString(locale, { month: "long", year: "numeric" });
  const yearOptions = Array.from({ length: 7 }).map((_, index) => selectedYear - 3 + index);

  return (
    <div className="space-y-10">
      <section className="flex items-center gap-8 border-b border-[#dce9e2] pb-2">
        <Link href="/app/ledger" className="pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#006f1d]/60 hover:text-[#1b3641]">
          {tr(language, "Activity", "Hoạt động")}
        </Link>
        <Link href="/app/ledger/reports" className="border-b-2 border-[#006f1d] pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#1b3641]">
          {tr(language, "Reports", "Báo cáo")}
        </Link>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="flex h-48 flex-col justify-between rounded-3xl border border-[#d8e8f3] bg-white p-7 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#6f8793]">{tr(language, "Total Expense", "Tổng chi tiêu")}</p>
            <span className="material-symbols-outlined text-[#a73b21]">trending_down</span>
          </div>
          <div>
            <p className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">
              {asCurrency(totalExpense, currency)}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-[#eaffe2] px-3 py-1 text-xs font-semibold text-[#0f7a2f]">
               {tr(language, "Live this month", "Trong tháng này")}
            </span>
          </div>
        </article>

        <article className="flex h-48 flex-col justify-between rounded-3xl border border-[#d8e8f3] bg-[#e7f6ff] p-7 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#6f8793]">{tr(language, "Budget Adherence", "Tuân thủ ngân sách")}</p>
            <span className="material-symbols-outlined text-[#1b3641]">verified</span>
          </div>
          <div>
            <p className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">
              {budgetAdherence.toFixed(1)}%
            </p>
            <p className="mt-1 text-sm text-[#49636f]">
              {budgetAdherence > 100 ? tr(language, "Over target", "Vượt mục tiêu") : tr(language, "On track performance", "Đang đúng kế hoạch")}
            </p>
          </div>
        </article>

        <article className="relative flex h-48 flex-col justify-between overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#006f1d_0%,#006118_100%)] p-7 text-[#eaffe2] shadow-sm">
          <div className="pointer-events-none absolute right-[-20px] top-[-24px] h-28 w-28 rounded-full bg-white/10 blur-xl" />
          <div className="relative z-10 flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#d8ffe0]">{tr(language, "Top Savings", "Tiết kiệm tối đa")}</p>
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div className="relative z-10">
            <p className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-tight">{asCurrency(topSavings, currency)}</p>
            <p className="mt-1 text-xs text-[#d8ffe0]">{tr(language, "Potential optimization this month", "Khoản tối ưu tiềm năng trong tháng")}</p>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
              <h2 className="font-[var(--font-manrope)] text-3xl font-bold text-[#1b3641]">{tr(language, "Performance Analytics", "Phân tích hiệu suất")}</h2>
              <p className="text-[#6f8793]">{tr(language, "Visualizing your fiscal flow across time horizons.", "Trực quan hóa dòng tiền theo từng mốc thời gian.")}</p>
            </div>
            <div className="rounded-full bg-[#d8e8f3] p-1">
              <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1b3641] shadow-sm">{tr(language, "Monthly", "Theo tháng")}</button>
            </div>
          </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <article className="rounded-3xl border border-[#d8e8f3] bg-white p-8 xl:col-span-8">
            <div className="mb-10 flex items-center justify-between">
              <h3 className="font-[var(--font-manrope)] text-xl font-semibold text-[#1b3641]">{tr(language, "Monthly Expense vs Budget", "Chi tiêu tháng so với ngân sách")}</h3>
              <div className="flex items-center gap-4 text-xs text-[#6f8793]">
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#006f1d]" />{tr(language, "Actual", "Thực tế")}</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#cfe6f2]" />{tr(language, "Budget", "Ngân sách")}</span>
              </div>
            </div>

            <MonthlyExpenseBudgetChart data={monthSeries} currency={currency} />
          </article>

          <article className="rounded-3xl border border-[#d8e8f3] bg-[#e7f6ff] p-8 xl:col-span-4">
            <h3 className="font-[var(--font-manrope)] text-xl font-semibold text-[#1b3641]">{tr(language, "Yearly Horizon", "Tầm nhìn năm")}</h3>
            <div className="mt-7 space-y-7">
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[#6f8793]">{tr(language, "Annual Budget", "Ngân sách năm")}</span>
                  <span className="font-semibold text-[#1b3641]">{asCurrency(totalBudget * 12, currency)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white">
                  <div className="h-full w-[24%] rounded-full bg-[#4d626c]" />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[#6f8793]">{tr(language, "Actual Spent (YTD)", "Đã chi (lũy kế năm)")}</span>
                  <span className="font-semibold text-[#1b3641]">{asCurrency(totalExpense * 3, currency)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white">
                  <div className="h-full w-[32%] rounded-full bg-[#006f1d]" />
                </div>
              </div>
            </div>
            <div className="mt-8 border-t border-white/60 pt-7">
              <p className="text-xs leading-relaxed text-[#49636f]">
                {tr(language, "You are tracking with healthy spending behavior compared to your current budget envelope.", "Bạn đang theo dõi tốt và duy trì mức chi tiêu ổn định so với ngân sách hiện tại.")}
              </p>
              <button className="mt-4 w-full rounded-full bg-white py-3 text-sm font-bold text-[#1b3641] shadow-sm hover:bg-[#f7fcff]">
                {tr(language, "Export PDF Report", "Xuất báo cáo PDF")}
              </button>
            </div>
          </article>
        </div>
      </section>

      <DailyExpenseCalendar
        currency={currency}
        monthLabel={monthLabel}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        yearOptions={yearOptions}
        language={language}
        days={calendarDays}
      />
    </div>
  );
}
