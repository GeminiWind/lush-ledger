"use client";

import { getDictionary } from "@/lib/i18n";
import { useMemo, useState } from "react";
import CashflowChart from "./CashflowChart";
import CategoryChart from "./CategoryChart";
import DailyCalendar from "./DailyCalendar";
import ExpenseBudgetChart from "./ExpenseBudgetChart";
import { asCurrency, formatMonthLabel, monthRank } from "./report-utils";
import type { ReportsViewMode, ReportsViewProps } from "@/features/ledger/types";

const chartColors = ["#0f7a2f", "#2e9f50", "#56ba73", "#86d19e", "#b8e9c3"];
const selectClassName =
  "appearance-none rounded-full border border-[#c3d8e5] bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-[#1b3641]";

export default function ReportsView({ language, currency, data }: ReportsViewProps) {
  const t = getDictionary(language);
  const [viewMode, setViewMode] = useState<ReportsViewMode>("monthly");

  const monthOptions = data.monthlySeries.map((item) => item.key);
  const yearlyOptions = data.yearlySeries.map((item) => Number(item.key));

  const lastMonthKey = monthOptions[monthOptions.length - 1] ?? data.bounds.lastMonthKey;
  const defaultFromIndex = Math.max(0, monthOptions.length - 6);
  const [monthlyFrom, setMonthlyFrom] = useState(monthOptions[defaultFromIndex] ?? data.bounds.firstMonthKey);
  const [monthlyTo, setMonthlyTo] = useState(lastMonthKey);

  const [yearlyFrom, setYearlyFrom] = useState(yearlyOptions[0] ?? data.bounds.firstYear);
  const [yearlyTo, setYearlyTo] = useState(yearlyOptions[yearlyOptions.length - 1] ?? data.bounds.lastYear);

  const monthlyRange = useMemo(() => {
    const fromRank = monthRank(monthlyFrom);
    const toRank = monthRank(monthlyTo);
    const lower = Math.min(fromRank, toRank);
    const upper = Math.max(fromRank, toRank);

    return data.monthlySeries.filter((point) => {
      const rank = monthRank(point.key);
      return rank >= lower && rank <= upper;
    });
  }, [data.monthlySeries, monthlyFrom, monthlyTo]);

  const yearlyRange = useMemo(() => {
    const lower = Math.min(yearlyFrom, yearlyTo);
    const upper = Math.max(yearlyFrom, yearlyTo);
    return data.yearlySeries.filter((point) => {
      const year = Number(point.key);
      return year >= lower && year <= upper;
    });
  }, [data.yearlySeries, yearlyFrom, yearlyTo]);

  const selectedSeries = viewMode === "monthly" ? monthlyRange : yearlyRange;

  const expenseBudgetRows = useMemo(() => {
    return selectedSeries.map((item) => ({
      label: viewMode === "monthly" ? formatMonthLabel(item.key, language) : item.key,
      expense: item.expense,
      budget: item.budget,
    }));
  }, [language, selectedSeries, viewMode]);

  const cashflowRows = useMemo(() => {
    return selectedSeries.map((item) => ({
      label: viewMode === "monthly" ? formatMonthLabel(item.key, language) : item.key,
      income: item.income,
      outcome: item.outcome,
    }));
  }, [language, selectedSeries, viewMode]);

  const categoryRows = useMemo(() => {
    const monthLower = Math.min(monthRank(monthlyFrom), monthRank(monthlyTo));
    const monthUpper = Math.max(monthRank(monthlyFrom), monthRank(monthlyTo));
    const yearLower = Math.min(yearlyFrom, yearlyTo);
    const yearUpper = Math.max(yearlyFrom, yearlyTo);

    const includeEntry = (dateISO: string) => {
      const key = dateISO.slice(0, 7);
      if (viewMode === "monthly") {
        const rank = monthRank(key);
        return rank >= monthLower && rank <= monthUpper;
      }

      const year = Number(dateISO.slice(0, 4));
      return year >= yearLower && year <= yearUpper;
    };

    const sums = data.expenseEntries.reduce((map, entry) => {
      if (!includeEntry(entry.dateISO)) {
        return map;
      }

      const label = entry.categoryName?.trim() || t.reportsTransactionFallback;
      map.set(label, (map.get(label) ?? 0) + entry.amount);
      return map;
    }, new Map<string, number>());

    return Array.from(sums.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: chartColors[index % chartColors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [data.expenseEntries, monthlyFrom, monthlyTo, t.reportsTransactionFallback, viewMode, yearlyFrom, yearlyTo]);

  const budgetStateOver = data.summary.budget > 0 && data.summary.totalExpense > data.summary.budget;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <article className="rounded-[2rem] border border-[#dce9e2] bg-white px-7 py-6 shadow-[0_1px_2px_rgba(27,54,65,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#647e8c]">{t.reportsTotalExpense}</p>
            <span className="material-symbols-outlined text-[#006f1d]">trending_down</span>
          </div>
          <p className="mt-3 font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">
            {asCurrency(data.summary.totalExpense, currency)}
          </p>
          <span className="mt-3 inline-flex rounded-full bg-[#eaffe2] px-3 py-1 text-xs font-semibold text-[#006f1d]">
            {t.reportsLiveThisMonth}
          </span>
        </article>

        <article className="rounded-[2rem] border border-[#dce9e2] bg-[#f8fcff] px-7 py-6 shadow-[0_1px_2px_rgba(27,54,65,0.06)]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#647e8c]">{t.reportsBudgetAdherence}</p>
            <span className="material-symbols-outlined text-[#49636f]">verified</span>
          </div>
          <p className="mt-3 font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">
            {Number.isFinite(data.summary.budgetAdherence) ? `${data.summary.budgetAdherence.toFixed(1)}%` : "0%"}
          </p>
          <p className={`mt-3 text-xs font-semibold ${budgetStateOver ? "text-[#a73b21]" : "text-[#006f1d]"}`}>
            {budgetStateOver ? t.reportsOverTarget : t.reportsOnTrackPerformance}
          </p>
        </article>

        <article className="relative overflow-hidden rounded-[2rem] bg-[#006f1d] px-7 py-6 text-[#eaffe2] shadow-[0_10px_30px_-18px_rgba(0,111,29,0.75)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="relative z-10 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{t.reportsTopSavings}</p>
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <p className="relative z-10 mt-3 font-[var(--font-manrope)] text-3xl font-bold tracking-tight">
            {asCurrency(data.summary.topSavingsAmount, currency)}
          </p>
          <p className="relative z-10 mt-2 text-xs font-medium text-[#d8f4dd]">{t.reportsPotentialOptimization}</p>
        </article>
      </section>

      <section className="space-y-6 rounded-[2rem] border border-[#dce9e2] bg-[#f4faff] p-5 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-tight text-[#1b3641]">
              {t.reportsUnifiedAnalysis}
            </h2>
            <p className="mt-1 text-sm text-[#49636f]">{t.reportsUnifiedAnalysisSubtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  id="reports-view-mode"
                  className={selectClassName}
                  value={viewMode}
                  onChange={(event) => setViewMode(event.target.value as ReportsViewMode)}
                >
                  <option value="monthly">{t.reportsMonthly}</option>
                  <option value="yearly">{t.reportsYearlyHorizon}</option>
                </select>
                <span className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6f8793]">
                  expand_more
                </span>
              </div>
            </div>

            {viewMode === "monthly" ? (
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#647e8c]" htmlFor="reports-month-from">
                  {t.reportsRangeFrom}
                </label>
                <div className="relative">
                  <select
                    id="reports-month-from"
                    className={selectClassName}
                    value={monthlyFrom}
                    onChange={(event) => setMonthlyFrom(event.target.value)}
                  >
                    {monthOptions.map((key) => (
                      <option key={`from-${key}`} value={key}>
                        {formatMonthLabel(key, language, "long")}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6f8793]">
                    expand_more
                  </span>
                </div>

                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#647e8c]" htmlFor="reports-month-to">
                  {t.reportsRangeTo}
                </label>
                <div className="relative">
                  <select
                    id="reports-month-to"
                    className={selectClassName}
                    value={monthlyTo}
                    onChange={(event) => setMonthlyTo(event.target.value)}
                  >
                    {monthOptions.map((key) => (
                      <option key={`to-${key}`} value={key}>
                        {formatMonthLabel(key, language, "long")}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6f8793]">
                    expand_more
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#647e8c]" htmlFor="reports-year-from">
                  {t.reportsRangeFrom}
                </label>
                <div className="relative">
                  <select
                    id="reports-year-from"
                    className={selectClassName}
                    value={yearlyFrom}
                    onChange={(event) => setYearlyFrom(Number(event.target.value))}
                  >
                    {yearlyOptions.map((year) => (
                      <option key={`year-from-${year}`} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6f8793]">
                    expand_more
                  </span>
                </div>

                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#647e8c]" htmlFor="reports-year-to">
                  {t.reportsRangeTo}
                </label>
                <div className="relative">
                  <select
                    id="reports-year-to"
                    className={selectClassName}
                    value={yearlyTo}
                    onChange={(event) => setYearlyTo(Number(event.target.value))}
                  >
                    {yearlyOptions.map((year) => (
                      <option key={`year-to-${year}`} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6f8793]">
                    expand_more
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <ExpenseBudgetChart
            rows={expenseBudgetRows}
            currency={currency}
            title={t.reportsMonthlyExpenseVsBudget}
            actualLabel={t.reportsActual}
            budgetLabel={t.reportsBudget}
          />
          <CategoryChart
            rows={categoryRows}
            currency={currency}
            title={t.reportsSpendByCategory}
            totalLabel={t.reportsTotal}
            noDataLabel={t.reportsNoExpenseData}
          />
        </div>

        <CashflowChart
          rows={cashflowRows}
          currency={currency}
          title={t.reportsIncomeVsOutcome}
          incomeLabel={t.reportsMonthlyCashflow.split("(")[0].trim()}
          outcomeLabel={t.reportsOutcome}
        />
      </section>

      <DailyCalendar
        language={language}
        currency={currency}
        monthOptions={monthOptions}
        expenseEntries={data.expenseEntries}
        labels={{
          title: t.calendarDailyExpenseTitle,
          weekdays: [
            t.calendarWeekdayMon,
            t.calendarWeekdayTue,
            t.calendarWeekdayWed,
            t.calendarWeekdayThu,
            t.calendarWeekdayFri,
            t.calendarWeekdaySat,
            t.calendarWeekdaySun,
          ],
          detailsTitle: t.calendarDailyDetailsTitle,
          totalSpent: t.calendarTotalSpent,
          closeView: t.calendarCloseView,
          noExpenseData: t.reportsNoExpenseData,
          fallbackTransaction: t.reportsTransactionFallback,
        }}
      />
    </div>
  );
}
