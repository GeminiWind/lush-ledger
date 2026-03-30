import { getDashboardData } from "@/lib/dashboard";
import { getDictionary } from "@/lib/i18n";
import { requireUser } from "@/lib/user";
import ActiveBudgetsPanel from "./ActiveBudgetsPanel";
import TopCategoriesPanel from "./TopCategoriesPanel";

const toCurrencyLabel = (amount: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(amount);
};

const shortDate = (date: Date, language: string) => {
  return new Intl.DateTimeFormat(language === "vi-VN" ? "vi-VN" : "en-US", {
    month: "short",
    day: "2-digit",
  })
    .format(date)
    .toUpperCase();
};

const budgetWidth = (value: number) => `${Math.min(100, Math.max(0, value))}%`;

const transactionMeta = (type: string, language: string) => {
  const t = getDictionary(language);
  if (type === "income") {
    return {
      sign: "+",
      amountClass: "text-[#006f1d]",
      status: t.dashStatusReceived,
      iconBg: "bg-[#eaffe2]",
      icon: "payments",
    };
  }

    return {
      sign: "-",
      amountClass: "text-[#1b3641]",
      status: t.dashStatusCompleted,
      iconBg: "bg-[#f0f4f8]",
      icon: "receipt_long",
    };
};

export default async function DashboardPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const t = getDictionary(language);
  const currency = user.settings?.currency ?? "VND";
  const data = await getDashboardData(user.id);
  const maxTrendValue = Math.max(...data.monthlySpendingTrend.map((item) => item.value), 1);

  return (
    <div className="space-y-6 lg:space-y-7">
      {data.warning ? (
        <section className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#f8cece] bg-[#fff5f5] px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#a73b21] text-white">
            <span className="material-symbols-outlined text-[20px]">warning</span>
          </div>
          <div className="min-w-[220px] flex-1">
            <p className="font-semibold text-[#1b3641]">{t.dashBudgetAlert}: {data.warning.name}</p>
            <p className="text-sm text-[#49636f]">
              {t.dashExceededBy} {toCurrencyLabel(data.warning.spent - data.warning.budget, currency)}.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="rounded-lg bg-[#a73b21] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c301a]">
              {t.dashReallocate}
            </button>
            <button className="rounded-md p-1 text-[#647e8c] hover:bg-white/60 hover:text-[#1b3641]" aria-label={t.dashDismissAlert}>
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <article className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.06)] xl:col-span-7">
          <div className="pointer-events-none absolute right-5 top-5 h-32 w-32 rounded-xl bg-[#0b6b1f]/10 blur-2xl" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#647e8c]">{t.dashTotalNetWorth}</p>
          <p className="mt-3 font-[var(--font-manrope)] text-4xl font-extrabold tracking-[-0.03em] text-[#1b3641] sm:text-5xl">
            {toCurrencyLabel(data.netWorth, currency)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            <span
              className={`rounded-xl px-3 py-1 text-xs font-semibold ${
                data.spendingDelta <= 0 ? "bg-[#eaffe2] text-[#006f1d]" : "bg-[#fff0ec] text-[#a73b21]"
              }`}
            >
              {data.spendingDelta <= 0 ? "\u2193" : "\u2191"}
              {Math.abs(data.spendingDelta).toFixed(1)}%
            </span>
            <span className="text-[#647e8c]">{t.dashVsLastMonth}</span>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#edf2ef] pt-5 sm:grid-cols-2">
            <div>
               <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#647e8c]">{t.dashAssets}</p>
              <p className="mt-1 font-[var(--font-manrope)] text-3xl font-bold text-[#1b3641]">
                {toCurrencyLabel(data.assetsTotal, currency)}
              </p>
            </div>
            <div>
               <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#647e8c]">{t.dashLiabilities}</p>
              <p className="mt-1 font-[var(--font-manrope)] text-3xl font-bold text-[#a73b21]">
                {toCurrencyLabel(data.liabilitiesTotal, currency)}
              </p>
            </div>
          </div>
        </article>

        <div className="space-y-5 xl:col-span-5">
          <article className="rounded-2xl border border-[#edf2ef] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#647e8c]">{t.dashMonthlySpending}</p>
                <p className="mt-1 font-[var(--font-manrope)] text-4xl font-bold text-[#1b3641]">
                  {toCurrencyLabel(data.monthSpending, currency)}
                </p>
              </div>
                <span className="material-symbols-outlined text-[#93a7b3]">insights</span>
              </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#647e8c]">{t.dashMonthlyLimit}</p>
                <p className="font-semibold text-[#1b3641]">{toCurrencyLabel(data.monthlyLimit, currency)}</p>
              </div>
              <p className="text-sm font-semibold text-[#006f1d]">{Math.round(data.monthlyUsedPercent)}% {t.dashUsed}</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf2ef]">
              <div
                className={`h-full rounded-full ${data.monthlyUsedPercent > 100 ? "bg-[#a73b21]" : "bg-[#006f1d]"}`}
                style={{ width: budgetWidth(data.monthlyUsedPercent) }}
              />
            </div>
            <div className="mt-6 border-t border-dashed border-[#dcb9ad] pt-4">
              <div className="flex items-end gap-2">
                {data.monthlySpendingTrend.map((month, index) => {
                  const height = 16 + (month.value / maxTrendValue) * 36;
                  const isCurrentMonth = index === data.monthlySpendingTrend.length - 1;
                  const isPeak = month.value === maxTrendValue;

                  return (
                    <div key={`${month.label}-${index}`} className="group flex flex-1 flex-col items-center gap-2">
                      <div className="relative flex h-14 w-full items-end justify-center">
                        <div className="pointer-events-none absolute -top-7 z-10 whitespace-nowrap rounded-md bg-[#1b3641] px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {toCurrencyLabel(month.value, currency)}
                        </div>
                        <div
                          className={`w-full rounded-sm transition-colors ${
                            isCurrentMonth
                              ? "bg-[#006f1d]"
                              : isPeak
                                ? "bg-[#4caf50]"
                                : "bg-[#dff3de] group-hover:bg-[#7bc67e]"
                          }`}
                          style={{ height }}
                          title={`${month.label}: ${toCurrencyLabel(month.value, currency)}`}
                        />
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#647e8c]">{month.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className="flex items-center gap-3 rounded-2xl bg-[#042d10] px-4 py-4 text-white shadow-[0_2px_8px_rgba(4,45,16,0.25)]">
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#91f78e] hover:bg-white/10" aria-label={t.dashPrevSavingsGoal}>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <div className="flex flex-1 items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8cd89a]">{t.dashSavingsGoal}</p>
                <p className="font-[var(--font-manrope)] text-2xl font-bold leading-none">
                  {data.savingsProgress?.name ?? t.dashCreateOne}
                </p>
              </div>
              <div className="w-28 text-right">
                <p className="text-xs text-[#def4e2]">{Math.round(data.savingsProgress?.progress ?? 0)}% {t.dashComplete}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-[#91f78e]"
                    style={{ width: budgetWidth(data.savingsProgress?.progress ?? 0) }}
                  />
                </div>
              </div>
            </div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#91f78e] hover:bg-white/10" aria-label={t.dashNextSavingsGoal}>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </article>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TopCategoriesPanel categories={data.topCategories} currency={currency} language={language} />
        <ActiveBudgetsPanel budgets={data.activeBudgets} currency={currency} daysRemaining={data.daysRemaining} language={language} />
      </section>

      <section className="rounded-2xl border border-[#edf2ef] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[var(--font-manrope)] text-2xl font-bold">{t.dashRecentEntries}</h2>
          <div className="flex items-center gap-4">
            <button className="rounded-lg bg-[#f0f4f8] px-4 py-2 text-sm font-semibold text-[#1b3641]">{t.dashFilters}</button>
            <button className="text-sm font-semibold text-[#006f1d] hover:text-[#04551b]">{t.dashExportCsv}</button>
          </div>
        </div>

        <div className="mt-4 divide-y divide-[#edf2ef]">
          {data.recentEntries.length === 0 ? (
            <p className="py-5 text-sm text-[#647e8c]">{t.dashNoRecentEntries}</p>
          ) : (
            data.recentEntries.map((entry) => {
              const meta = transactionMeta(entry.type, language);
              return (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
                  <div className="flex items-center gap-4">
                    <p className="w-14 text-xs font-semibold uppercase tracking-[0.06em] text-[#647e8c]">{shortDate(entry.date, language)}</p>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm ${meta.iconBg}`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {entry.category?.icon?.trim() || meta.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#1b3641]">{entry.notes?.trim() || entry.account.name}</p>
                      <p className="text-sm text-[#647e8c]">{entry.category?.name || t.dashUncategorized}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-[var(--font-manrope)] text-lg font-bold ${meta.amountClass}`}>
                      {meta.sign}
                      {toCurrencyLabel(Number(entry.amount), currency)}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#647e8c]">{meta.status}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </section>
    </div>
  );
}
