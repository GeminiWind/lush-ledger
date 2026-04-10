"use client";

import { localeDateLabel, monthKey, startOfMonthDate } from "@/lib/date";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import AddCategoryModal from "@/features/atelier/dialogs/AddCategoryModal";
import TotalCapCard from "@/features/atelier/components/TotalCapCard";
import CategoryAtelierGrid from "@/features/atelier/components/CategoryAtelierGrid";
import AutoTransferSettings from "@/features/savings/components/auto-transfer-settings";

const toNumber = (value: unknown) => Number(value ?? 0);

type Props = {
  language: string;
  currency: string;
  now: Date;
  monthStart: Date;
  categories: Array<{
    id: string;
    name: string;
    icon: string | null;
  }>;
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
  monthLimits: Array<{
    categoryId: string;
    limit: unknown;
    warningEnabled: boolean;
    warnAt: number;
  }>;
};

const monthKeyOf = (value: Date) => monthKey(startOfMonthDate(value));

export default function AtelierPageView({
  language,
  currency,
  now,
  monthStart,
  categories,
  monthTransactions,
  monthlyCap,
  monthLimits,
}: Props) {
  const t = useNamespacedTranslation("atelier", language);
  const monthLimitByCategoryId = new Map(monthLimits.map((item) => [item.categoryId, item]));

  const monthIncome = monthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const categoryStats = categories
    .map((category) => {
      const monthLimit = monthLimitByCategoryId.get(category.id);
      const spent = monthTransactions
        .filter((tx) => tx.categoryId === category.id && tx.type === "expense")
        .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

      const limit = toNumber(monthLimit?.limit);
      const usage = limit > 0 ? Math.min(spent / limit, 1) : 0;

        return {
          id: category.id,
          name: category.name,
          icon: category.icon || "category",
          limit,
          spent,
          usage,
        warningEnabled: monthLimit?.warningEnabled ?? true,
        warnAt: monthLimit?.warnAt ?? 80,
      };
    })
    .sort((a, b) => b.limit - a.limit || b.spent - a.spent);

  const totalCap = toNumber(monthlyCap.totalCap);
  const allocated = toNumber(monthlyCap.totalLimit);
  const remaining = Math.max(totalCap - allocated, 0);
  const capProgress = totalCap > 0 ? Math.min(allocated / totalCap, 1) : 0;

  const monthLabel = localeDateLabel(now, language, { month: "long", year: "numeric" });

  return (
    <div className="flex w-full flex-col gap-10">
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#49636f]">{t("atelierFiscalMasterplan")}</p>
              <h1 className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-[-0.02em] text-[#1b3641]">
                {t("atelierBudgetAllocation")}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t("atelierPeriod")}</p>
              <p className="font-[var(--font-manrope)] text-xl font-bold text-[#2e7d32]">{monthLabel}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
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

        <section className="space-y-5">
          {categoryStats.length === 0 ? (
            <div className="space-y-5">
              <div className="rounded-3xl border-2 border-dashed border-[#c7dce9] bg-white p-12 text-center text-[#6f8793]">
                {t("atelierAddCategoriesHint")}
              </div>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <AddCategoryModal currency={currency} language={language} />
              </div>
            </div>
          ) : (
            <CategoryAtelierGrid categories={categoryStats} currency={currency} language={language} />
          )}
        </section>
    </div>
  );
}
