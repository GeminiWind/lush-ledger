"use client";

import { useMemo, useState } from "react";
import { getDictionary } from "@/lib/i18n";

type BudgetItem = {
  id: string;
  name: string;
  spent: number;
  budget: number;
  remaining: number;
  isOverspent: boolean;
};

type Props = {
  budgets: BudgetItem[];
  currency: string;
  daysRemaining: number;
  language: string;
};

const toCurrencyLabel = (amount: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
};

export default function ActiveBudgetsPanel({ budgets, currency, daysRemaining, language }: Props) {
  const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "healthy" | "overspent">("all");
  const t = getDictionary(language);
  const itemsPerPage = 2;

  const filteredBudgets = useMemo(() => {
    if (filter === "healthy") {
      return budgets.filter((budget) => !budget.isOverspent);
    }
    if (filter === "overspent") {
      return budgets.filter((budget) => budget.isOverspent);
    }
    return budgets;
  }, [budgets, filter]);

  const pageCount = Math.max(1, Math.ceil(filteredBudgets.length / itemsPerPage));
  const activePageIndex = Math.min(pageIndex, pageCount - 1);

  const canGoPrev = activePageIndex > 0;
  const canGoNext = activePageIndex < pageCount - 1;

  const visibleBudgets = useMemo(() => {
    const start = activePageIndex * itemsPerPage;
    return filteredBudgets.slice(start, start + itemsPerPage);
  }, [activePageIndex, filteredBudgets]);

  return (
    <article className="xl:col-span-2 rounded-2xl bg-[#edf3ee] p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-manrope)] text-2xl font-bold">{t.activeBudgetsTitle}</h2>
        <div className="flex items-center gap-2 text-[#49636f]">
          <span className="mr-1 text-xs font-semibold text-[#647e8c]">
            {filteredBudgets.length === 0 ? "0/0" : `${activePageIndex + 1}/${pageCount}`}
          </span>
          <label className="relative inline-flex items-center">
            <span className="pointer-events-none material-symbols-outlined absolute left-2 text-[16px] text-[#49636f]">filter_alt</span>
            <select
              value={filter}
              onChange={(event) => {
                setFilter(event.target.value as "all" | "healthy" | "overspent");
                setPageIndex(0);
              }}
              className="appearance-none rounded-full bg-white py-2 pl-8 pr-7 text-xs font-semibold capitalize text-[#1b3641] shadow-[0_1px_2px_rgba(0,0,0,0.06)] outline-none ring-[#93b3a0] focus:ring-2"
              aria-label={t.activeBudgetsFilterLabel}
            >
              <option value="all">{t.activeBudgetsFilterAll}</option>
              <option value="healthy">{t.activeBudgetsFilterHealthy}</option>
              <option value="overspent">{t.activeBudgetsFilterOverspent}</option>
            </select>
            <span className="pointer-events-none material-symbols-outlined absolute right-2 text-[14px] text-[#647e8c]">expand_more</span>
          </label>
          <button
            type="button"
            disabled={!canGoPrev}
            onClick={() => setPageIndex(Math.max(0, activePageIndex - 1))}
            className="rounded-full bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t.activeBudgetsPrev}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          <button
            type="button"
            disabled={!canGoNext}
            onClick={() => setPageIndex(Math.min(pageCount - 1, activePageIndex + 1))}
            className="rounded-full bg-white p-2 shadow-[0_1px_2px_rgba(0,0,0,0.06)] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t.activeBudgetsNext}
          >
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleBudgets.length === 0 ? (
          <p className="text-sm text-[#647e8c]">
              {budgets.length === 0
                ? t.activeBudgetsNoLimits
                : `${t.activeBudgetsNoFiltered} (${filter === "all" ? t.activeBudgetsFilterAll : filter === "healthy" ? t.activeBudgetsFilterHealthy : t.activeBudgetsFilterOverspent})`}
            </p>
        ) : (
          visibleBudgets.map((budget) => (
            <div
              key={budget.id}
              className={`rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
                budget.isOverspent ? "border-[#f8cece]" : "border-[#d5f1da]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-[#1b3641]">{budget.name}</h3>
                  <p className="text-sm text-[#647e8c]">{t.activeBudgetsEndsIn} {daysRemaining} {t.activeBudgetsDays}</p>
                </div>
                <span
                  className={`rounded px-3 py-1 text-[11px] font-semibold uppercase ${
                    budget.isOverspent ? "bg-[#a73b21] text-white" : "bg-[#eaffe2] text-[#006f1d]"
                  }`}
                >
                  {budget.isOverspent ? t.activeBudgetsOverspent : t.activeBudgetsHealthy}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#49636f]">
                {t.activeBudgetsSpent} <span className="font-semibold text-[#1b3641]">{toCurrencyLabel(budget.spent, currency)}</span> | {t.activeBudgetsBudget}{" "}
                <span className="font-semibold text-[#1b3641]">{toCurrencyLabel(budget.budget, currency)}</span>
              </p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf2ef]">
                <div
                  className={`h-full rounded-full ${budget.isOverspent ? "bg-[#a73b21]" : "bg-[#006f1d]"}`}
                  style={{ width: `${Math.min(100, (budget.spent / budget.budget) * 100)}%` }}
                />
              </div>
              <p className={`mt-3 text-sm font-semibold ${budget.isOverspent ? "text-[#a73b21]" : "text-[#006f1d]"}`}>
                {budget.isOverspent
                  ? `${t.activeBudgetsExcessThisMonth}: ${toCurrencyLabel(Math.abs(budget.remaining), currency)}.`
                  : `${toCurrencyLabel(budget.remaining, currency)} ${t.activeBudgetsRemainingLimit}.`}
              </p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
