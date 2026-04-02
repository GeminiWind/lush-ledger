import { prisma } from "@/lib/db";
import { getMonthRange, localeDateLabel, nowDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { requireUser } from "@/lib/user";
import { ensureMonthlyCapSnapshot, monthKeyOf } from "@/lib/monthly-cap";
import AddCategoryModal from "@/app/app/atelier/AddCategoryModal";
import TotalCapCard from "@/app/app/atelier/TotalCapCard";
import CategoryAtelierGrid from "@/app/app/atelier/CategoryAtelierGrid";

const toNumber = (value: unknown) => Number(value ?? 0);

export default async function AtelierPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const t = getDictionary(language);
  await materializeRecurringTransactions(user.id);
  const currency = user.settings?.currency || "VND";
  const now = nowDate();
  const { start, end } = getMonthRange(now);

  const [categories, monthTransactions, savingsPlans, monthlyCap] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, date: { gte: start, lte: end } },
    }),
    prisma.savingsPlan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    ensureMonthlyCapSnapshot(user.id, start, 0),
  ]);

  const monthLimits = await prisma.categoryMonthlyLimit.findMany({
    where: { userId: user.id, monthStart: start },
    select: { categoryId: true, limit: true, warningEnabled: true, warnAt: true },
  });
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
        icon: category.icon,
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

  const savingsTarget = savingsPlans.reduce(
    (sum, plan) => sum + toNumber(plan.monthlyContribution),
    0,
  );

  const savingsByPlan = savingsPlans.map((plan) => {
    const saved = monthTransactions
      .filter((tx) => tx.savingsPlanId === plan.id)
      .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

    return {
      id: plan.id,
      name: plan.name,
      target: toNumber(plan.monthlyContribution),
      saved,
    };
  });

  const savingsSaved = savingsByPlan.reduce((sum, plan) => sum + plan.saved, 0);
  const savingsCoverage =
    savingsTarget > 0 ? Math.min((savingsSaved / savingsTarget) * 100, 100) : 0;

  const monthLabel = localeDateLabel(now, language, { month: "long", year: "numeric" });

  return (
    <div className="flex w-full flex-col gap-10">
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#49636f]">{t.atelierFiscalMasterplan}</p>
              <h1 className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-[-0.02em] text-[#1b3641]">
                {t.atelierBudgetAllocation}
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t.atelierPeriod}</p>
              <p className="font-[var(--font-manrope)] text-xl font-bold text-[#2e7d32]">{monthLabel}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <TotalCapCard
              currency={currency}
              month={monthKeyOf(start)}
              totalCap={totalCap}
              allocated={allocated}
              remaining={remaining}
              monthIncome={monthIncome}
              capProgress={capProgress}
              language={language}
            />

            <article className="rounded-[2rem] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(27,54,65,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-[var(--font-manrope)] text-xl font-bold">{t.atelierMonthlySavingsPlan}</h2>
                  <p className="text-xs text-[#49636f]">{t.atelierAutomaticVaultAllocation}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  {t.atelierOn}
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t.atelierSavingsTarget}</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-3xl font-extrabold text-[#1b3641]">
                    {formatCurrency(savingsTarget, currency)}
                  </p>
                </div>

                <div className="space-y-2">
                  {savingsByPlan.length === 0 ? (
                    <p className="text-sm text-[#6f8793]">{t.atelierNoSavingsPlansYet}</p>
                  ) : (
                    savingsByPlan.slice(0, 3).map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between text-sm">
                        <span className="text-[#49636f]">{plan.name}</span>
                        <span className="font-semibold text-[#1b3641]">
                          {formatCurrency(plan.target, currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t.atelierGoalCoverage}</p>
                    <p className="font-[var(--font-manrope)] text-sm font-bold text-[#2e7d32]">
                      {Math.round(savingsCoverage)}% {t.atelierCovered}
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e4f1fa]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2e7d32] to-[#1f6f3a]"
                      style={{ width: `${Math.round(savingsCoverage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#6f8793]">
                    {t.atelierSavedThisMonth} <span className="font-semibold text-[#1b3641]">{formatCurrency(savingsSaved, currency)}</span>
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="space-y-5">
          {categoryStats.length === 0 ? (
            <div className="space-y-5">
              <div className="rounded-3xl border-2 border-dashed border-[#c7dce9] bg-white p-12 text-center text-[#6f8793]">
                {t.atelierAddCategoriesHint}
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
