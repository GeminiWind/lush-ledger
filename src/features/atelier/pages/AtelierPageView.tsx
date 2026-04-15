"use client";

import { localeDateLabel, monthKey, startOfMonthDate } from "@/lib/date";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import TotalCapCard from "@/features/atelier/components/TotalCapCard";
import CategoryAtelierGrid from "@/features/atelier/components/CategoryAtelierGrid";
import AddCategoryModal from "@/features/atelier/dialogs/AddCategoryModal";
import AutoTransferSettings from "@/features/savings/components/auto-transfer-settings";
import { buildAtelierMonthHref } from "@/features/atelier/list-view-model";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useTransition } from "react";
import type { AtelierListViewModel } from "@/features/atelier/types";

const toNumber = (value: unknown) => Number(value ?? 0);

export type AtelierPageViewProps = {
  language: string;
  currency: string;
  selectedMonth: string;
  monthOptions: string[];
  monthStart: Date;
  monthValidationError: string | null;
  listLoadError: string | null;
  listData: AtelierListViewModel;
  monthTransactions: Array<{
    type: string;
    amount: unknown;
    categoryId: string | null;
    savingsPlanId: string | null;
  }>;
  monthlyCap: {
    totalCap: unknown;
    totalLimit: unknown;
  };
};

const monthKeyOf = (value: Date) => monthKey(startOfMonthDate(value));

export default function AtelierPageView({
  language,
  currency,
  selectedMonth,
  monthOptions,
  monthStart,
  monthValidationError,
  listLoadError,
  listData,
  monthTransactions,
  monthlyCap,
}: AtelierPageViewProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useNamespacedTranslation("atelier", language);

  const monthIncome = monthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const totalCap = toNumber(monthlyCap.totalCap);
  const allocated = toNumber(monthlyCap.totalLimit);
  const remaining = Math.max(totalCap - allocated, 0);
  const capProgress = totalCap > 0 ? Math.min(allocated / totalCap, 1) : 0;
  const activeMonth = listData.month || selectedMonth;

  const monthLabel = localeDateLabel(startOfMonthDate(new Date(`${activeMonth}-01T00:00:00.000Z`)), language, {
    month: "long",
    year: "numeric",
  });

  const riskLabels = useMemo(
    () => ({
      healthy: t("atelierListRiskHealthy"),
      warning: t("atelierListRiskWarning"),
      overspent: t("atelierListRiskOverspent"),
      pending: t("atelierListStatusPending"),
    }),
    [t],
  );

  const onMonthChange = (nextMonth: string) => {
    startTransition(() => {
      router.replace(buildAtelierMonthHref(pathname, searchParams.toString(), nextMonth));
    });
  };

  const onRetry = () => {
    startTransition(() => {
      router.replace(buildAtelierMonthHref(pathname, searchParams.toString(), activeMonth));
      router.refresh();
    });
  };

  return (
    <div className="flex w-full flex-col gap-[var(--spacing-10)]">
        <section className="space-y-[var(--spacing-6)]">
          <div className="flex flex-wrap items-end justify-between gap-[var(--spacing-4)]">
            <div>
              <p className="text-[var(--font-label-md)] font-medium text-[var(--color-on-surface-variant)]">{t("atelierFiscalMasterplan")}</p>
              <h1 className="font-[var(--font-display)] text-[var(--font-display-lg)] font-extrabold text-[var(--color-on-surface)]">
                {t("atelierBudgetAllocation")}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-[var(--font-label-sm)] font-bold uppercase text-[var(--color-on-surface-variant)]">{t("atelierPeriod")}</p>
              <label htmlFor="atelier-list-month" className="sr-only">
                {t("atelierListMonthSelectorLabel")}
              </label>
      <select
                id="atelier-list-month"
                aria-label={t("atelierListMonthSelectorAria")}
                className="rounded-[var(--input-radius)] bg-[var(--input-bg)] px-[var(--spacing-3)] py-[var(--spacing-2)] font-[var(--font-display)] text-[var(--font-body-md)] font-bold text-[var(--color-primary)]"
                value={activeMonth}
                disabled={isPending}
                onChange={(event) => onMonthChange(event.target.value)}
              >
                {monthOptions.map((option) => (
                  <option key={option} value={option}>
                    {localeDateLabel(startOfMonthDate(new Date(`${option}-01T00:00:00.000Z`)), language, {
                      month: "long",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-[var(--spacing-6)] xl:grid-cols-[2fr_1fr]">
            <TotalCapCard
              currency={currency}
              month={monthKeyOf(monthStart)}
              totalCap={totalCap}
              allocated={allocated}
              remaining={remaining}
              monthIncome={monthIncome}
              capProgress={capProgress}
              language={language}
            />

            <AutoTransferSettings language={language} currency={currency} />
          </div>
        </section>

        <section className="space-y-[var(--spacing-4)]">
          <p className="max-w-3xl text-[var(--font-label-md)] text-[var(--color-on-surface-variant)]">
            {t("atelierListThresholdContext")}
          </p>

          {monthValidationError || listLoadError ? (
            <div className="rounded-[var(--card-radius)] bg-[var(--card-bg)] p-[var(--spacing-10)] text-center text-[var(--color-on-surface-variant)] shadow-[var(--shadow-ambient)]">
              <p className="font-semibold text-[var(--color-error)]">{monthValidationError || listLoadError}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-[var(--spacing-6)] rounded-[var(--btn-radius)] bg-[var(--gradient-primary)] px-[var(--btn-padding-x)] py-[var(--btn-padding-y)] font-semibold text-[var(--color-on-primary)] disabled:opacity-[var(--opacity-glass)]"
                disabled={isPending}
              >
                {isPending ? t("atelierActionSaving") : t("atelierActionSave")}
              </button>
            </div>
          ) : listData.categories.length === 0 ? (
            <div className="space-y-[var(--spacing-4)]">
              <div className="rounded-[var(--card-radius)] bg-[var(--card-bg)] p-[var(--spacing-10)] text-center text-[var(--color-on-surface-variant)] shadow-[var(--shadow-ambient)]">
                {t("atelierAddCategoriesHint")}
              </div>
              <CategoryAtelierGrid
                categories={[]}
                currency={currency}
                language={language}
                riskLabels={riskLabels}
                pendingLabel={t("atelierListStatusPending")}
                addCategoryTrigger={<AddCategoryModal currency={currency} language={language} />}
              />
            </div>
          ) : (
            <CategoryAtelierGrid
              categories={listData.categories}
              currency={currency}
              language={language}
              riskLabels={riskLabels}
              pendingLabel={t("atelierListStatusPending")}
              addCategoryTrigger={<AddCategoryModal currency={currency} language={language} />}
            />
          )}

          {isPending ? (
            <p className="text-[var(--font-label-sm)] font-semibold uppercase text-[var(--color-on-surface-variant)]">{monthLabel}</p>
          ) : null}
        </section>
    </div>
  );
}
