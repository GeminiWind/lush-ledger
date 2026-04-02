import Link from "next/link";
import DailyExpenseCalendar from "@/app/app/ledger/reports/DailyExpenseCalendar";
import MonthlyCashflowChart from "@/app/app/ledger/reports/MonthlyCashflowChart";
import MonthlyExpenseBudgetChart from "@/app/app/ledger/reports/MonthlyExpenseBudgetChart";
import { prisma } from "@/lib/db";
import { DateTime } from "luxon";
import { addDaysDate, addMonthsDate, getMonthRange, localeDateLabel, localeTimeLabel, monthKey, nowDate, startOfMonthDate, toISODate } from "@/lib/date";
import { getDictionary } from "@/lib/i18n";
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
  const t = getDictionary(language);
  const locale = language === "vi-VN" ? "vi-VN" : "en-US";
  const currency = user.settings?.currency ?? "VND";
  const today = nowDate();
  const todayDateTime = DateTime.fromJSDate(today);
  const params = await searchParams;
  const selectedYear = Math.min(2100, Math.max(2000, parseIntSafe(params.year, todayDateTime.year)));
  const selectedMonth = Math.min(12, Math.max(1, parseIntSafe(params.month, todayDateTime.month)));
  const selectedDate = DateTime.local(selectedYear, selectedMonth, 1).toJSDate();
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
        date: { gte: startOfMonthDate(addMonthsDate(start, -5)), lte: end },
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
    const date = startOfMonthDate(addMonthsDate(start, -(5 - index)));
    return {
      date,
      key: monthKey(date),
      label: localeDateLabel(date, locale, { month: "short" }).toUpperCase(),
    };
  });

  const monthCaps = await Promise.all(monthLabels.map((month) => ensureMonthlyCapSnapshot(user.id, month.date)));
  const budgetByMonth = new Map<string, number>(
    monthCaps.map((cap) => [monthKeyOf(cap.monthStart), toNumber(cap.totalLimit)]),
  );

  const incomeByMonth = new Map<string, number>();
  const expenseByMonth = new Map<string, number>();
  for (const tx of recentTransactions) {
    const key = monthKey(tx.date);
    const amount = toNumber(tx.amount);
    if (tx.type === "income") {
      incomeByMonth.set(key, (incomeByMonth.get(key) || 0) + amount);
      continue;
    }
    if (tx.type === "expense") {
      expenseByMonth.set(key, (expenseByMonth.get(key) || 0) + amount);
    }
  }

  const cashflowSeries = monthLabels.map((month) => ({
    ...month,
    income: incomeByMonth.get(month.key) || 0,
    expense: expenseByMonth.get(month.key) || 0,
  }));

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
    const key = toISODate(tx.date);
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
      title: tx.notes?.trim() || tx.category?.name || t.reportsTransactionFallback,
      subtitle: `${tx.category?.name || t.ledgerUncategorized} • ${localeTimeLabel(tx.date, locale, {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      amount,
    });
  }

  const weekday = (DateTime.fromJSDate(start).weekday + 6) % 7;
  const calendarStart = addDaysDate(start, -weekday);

  const dailyTotals = Array.from(dayMap.values()).map((day) => day.total);
  const maxDailyTotal = Math.max(...dailyTotals, 1);

  const calendarDays = Array.from({ length: 42 }).map((_, index) => {
    const date = addDaysDate(calendarStart, index);
    const key = toISODate(date);
    const source = dayMap.get(key);
    const total = source?.total || 0;
    const level = total > 0 ? Math.ceil((total / maxDailyTotal) * 5) : 0;

    return {
      key,
      day: DateTime.fromJSDate(date).day,
      inMonth: DateTime.fromJSDate(date).month === DateTime.fromJSDate(start).month,
      total,
      level,
      entries: source?.entries || [],
    };
  });

  const monthLabel = localeDateLabel(selectedDate, locale, { month: "long", year: "numeric" });
  const yearOptions = Array.from({ length: 7 }).map((_, index) => selectedYear - 3 + index);

  return (
    <div className="space-y-10">
      <section className="flex items-center gap-8 border-b border-[#dce9e2] pb-2">
        <Link href="/app/ledger" className="pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#006f1d]/60 hover:text-[#1b3641]">
          {t.ledgerTabActivity}
        </Link>
        <Link href="/app/ledger/reports" className="border-b-2 border-[#006f1d] pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#1b3641]">
          {t.ledgerTabReports}
        </Link>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <article className="flex h-48 flex-col justify-between rounded-3xl border border-[#d8e8f3] bg-white p-7 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#6f8793]">{t.reportsTotalExpense}</p>
            <span className="material-symbols-outlined text-[#a73b21]">trending_down</span>
          </div>
          <div>
            <p className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">
              {asCurrency(totalExpense, currency)}
            </p>
            <span className="mt-2 inline-flex rounded-full bg-[#eaffe2] px-3 py-1 text-xs font-semibold text-[#0f7a2f]">
               {t.reportsLiveThisMonth}
            </span>
          </div>
        </article>

        <article className="flex h-48 flex-col justify-between rounded-3xl border border-[#d8e8f3] bg-[#e7f6ff] p-7 shadow-sm">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#6f8793]">{t.reportsBudgetAdherence}</p>
            <span className="material-symbols-outlined text-[#1b3641]">verified</span>
          </div>
          <div>
            <p className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">
              {budgetAdherence.toFixed(1)}%
            </p>
            <p className="mt-1 text-sm text-[#49636f]">
              {budgetAdherence > 100 ? t.reportsOverTarget : t.reportsOnTrackPerformance}
            </p>
          </div>
        </article>

        <article className="relative flex h-48 flex-col justify-between overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#006f1d_0%,#006118_100%)] p-7 text-[#eaffe2] shadow-sm">
          <div className="pointer-events-none absolute right-[-20px] top-[-24px] h-28 w-28 rounded-full bg-white/10 blur-xl" />
          <div className="relative z-10 flex items-start justify-between">
            <p className="text-sm font-medium uppercase tracking-[0.15em] text-[#d8ffe0]">{t.reportsTopSavings}</p>
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <div className="relative z-10">
            <p className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-tight">{asCurrency(topSavings, currency)}</p>
            <p className="mt-1 text-xs text-[#d8ffe0]">{t.reportsPotentialOptimization}</p>
          </div>
        </article>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
              <h2 className="font-[var(--font-manrope)] text-3xl font-bold text-[#1b3641]">{t.reportsPerformanceAnalytics}</h2>
              <p className="text-[#6f8793]">{t.reportsFlowHorizons}</p>
            </div>
            <div className="rounded-full bg-[#d8e8f3] p-1">
              <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#1b3641] shadow-sm">{t.reportsMonthly}</button>
            </div>
          </div>

        <div className="space-y-6">
          <article className="rounded-3xl border border-[#d8e8f3] bg-white p-8">
            <div className="mb-8 flex items-center justify-between">
              <h3 className="font-[var(--font-manrope)] text-xl font-semibold text-[#1b3641]">{t.reportsMonthlyCashflow}</h3>
              <div className="flex items-center gap-4 text-xs text-[#6f8793]">
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#0f7a2f]" />{t.txTypeIncome}</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#a73b21]" />{t.txTypeExpense}</span>
              </div>
            </div>

            <MonthlyCashflowChart
              data={cashflowSeries}
              currency={currency}
              incomeLabel={t.txTypeIncome}
              expenseLabel={t.txTypeExpense}
            />
          </article>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <article className="rounded-3xl border border-[#d8e8f3] bg-white p-8 xl:col-span-8">
              <div className="mb-10 flex items-center justify-between">
                <h3 className="font-[var(--font-manrope)] text-xl font-semibold text-[#1b3641]">{t.reportsMonthlyExpenseVsBudget}</h3>
              <div className="flex items-center gap-4 text-xs text-[#6f8793]">
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#006f1d]" />{t.reportsActual}</span>
                <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#cfe6f2]" />{t.reportsBudget}</span>
              </div>
            </div>

            <MonthlyExpenseBudgetChart data={monthSeries} currency={currency} />
            </article>

            <article className="rounded-3xl border border-[#d8e8f3] bg-[#e7f6ff] p-8 xl:col-span-4">
              <h3 className="font-[var(--font-manrope)] text-xl font-semibold text-[#1b3641]">{t.reportsYearlyHorizon}</h3>
              <div className="mt-7 space-y-7">
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[#6f8793]">{t.reportsAnnualBudget}</span>
                    <span className="font-semibold text-[#1b3641]">{asCurrency(totalBudget * 12, currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white">
                    <div className="h-full w-[24%] rounded-full bg-[#4d626c]" />
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-[#6f8793]">{t.reportsActualSpentYtd}</span>
                    <span className="font-semibold text-[#1b3641]">{asCurrency(totalExpense * 3, currency)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white">
                    <div className="h-full w-[32%] rounded-full bg-[#006f1d]" />
                  </div>
                </div>
              </div>
              <div className="mt-8 border-t border-white/60 pt-7">
                <p className="text-xs leading-relaxed text-[#49636f]">
                  {t.reportsHealthyBehaviorHint}
                </p>
                <button className="mt-4 w-full rounded-full bg-white py-3 text-sm font-bold text-[#1b3641] shadow-sm hover:bg-[#f7fcff]">
                  {t.reportsExportPdf}
                </button>
              </div>
            </article>
          </div>
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
