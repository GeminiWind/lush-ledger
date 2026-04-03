"use client";

import { useMemo, useState } from "react";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import type { ActiveBudgetsPanelProps } from "@/features/dashboard/types";

const toCurrencyLabel = (amount: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
};

export default function ActiveBudgetsPanel({ budgets, currency, daysRemaining, language }: ActiveBudgetsPanelProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [filter, setFilter] = useState<"all" | "healthy" | "overspent">("all");
  const t = useNamespacedTranslation("atelier", language);
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
  const hasMultiplePages = pageCount > 1;

  const visibleBudgets = useMemo(() => {
    const start = activePageIndex * itemsPerPage;
    return filteredBudgets.slice(start, start + itemsPerPage);
  }, [activePageIndex, filteredBudgets]);

  return (
    <article className="xl:col-span-2 rounded-2xl bg-[#edf3ee] p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[var(--font-manrope)] text-2xl font-bold">{t("atelier.activeBudgetsTitle")}</h2>
        <div className="flex items-center gap-2 text-[#49636f]">
          <button
            type="button"
            onClick={() => {
              const next = filter === "all" ? "healthy" : filter === "healthy" ? "overspent" : "all";
              setFilter(next);
              setPageIndex(0);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1b3641] shadow-sm transition-colors hover:text-[#006f1d]"
            aria-label={t("atelier.activeBudgetsFilterLabel")}
            title={`${t("atelier.activeBudgetsFilterLabel")}: ${
              filter === "all" ? t("atelier.activeBudgetsFilterAll") : filter === "healthy" ? t("atelier.activeBudgetsFilterHealthy") : t("atelier.activeBudgetsFilterOverspent")
            }`}
          >
            <span className="material-symbols-outlined text-xl">filter_alt</span>
          </button>
          <button
            type="button"
            disabled={!hasMultiplePages}
            onClick={() => setPageIndex(activePageIndex === 0 ? pageCount - 1 : activePageIndex - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1b3641] shadow-sm transition-colors hover:text-[#006f1d] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("atelier.activeBudgetsPrev")}
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <button
            type="button"
            disabled={!hasMultiplePages}
            onClick={() => setPageIndex(activePageIndex === pageCount - 1 ? 0 : activePageIndex + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#1b3641] shadow-sm transition-colors hover:text-[#006f1d] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t("atelier.activeBudgetsNext")}
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {visibleBudgets.length === 0 ? (
          <p className="text-sm text-[#647e8c]">
              {budgets.length === 0
                ? t("atelier.activeBudgetsNoLimits")
                : `${t("atelier.activeBudgetsNoFiltered")} (${filter === "all" ? t("atelier.activeBudgetsFilterAll") : filter === "healthy" ? t("atelier.activeBudgetsFilterHealthy") : t("atelier.activeBudgetsFilterOverspent")})`}
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
                  <p className="text-sm text-[#647e8c]">{t("atelier.activeBudgetsEndsIn")} {daysRemaining} {t("atelier.activeBudgetsDays")}</p>
                </div>
                <span
                  className={`rounded px-3 py-1 text-[11px] font-semibold uppercase ${
                    budget.isOverspent ? "bg-[#a73b21] text-white" : "bg-[#eaffe2] text-[#006f1d]"
                  }`}
                >
                  {budget.isOverspent ? t("atelier.activeBudgetsOverspent") : t("atelier.activeBudgetsHealthy")}
                </span>
              </div>
              <p className="mt-3 text-sm text-[#49636f]">
                {t("atelier.activeBudgetsSpent")} <span className="font-semibold text-[#1b3641]">{toCurrencyLabel(budget.spent, currency)}</span> | {t("atelier.activeBudgetsBudget")}{" "}
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
                  ? `${t("atelier.activeBudgetsExcessThisMonth")}: ${toCurrencyLabel(Math.abs(budget.remaining), currency)}.`
                  : `${toCurrencyLabel(budget.remaining, currency)} ${t("atelier.activeBudgetsRemainingLimit")}.`}
              </p>
            </div>
          ))
        )}
      </div>
    </article>
  );
}
