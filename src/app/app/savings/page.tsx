import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { materializeRecurringTransactions } from "@/lib/recurring";
import { requireUser } from "@/lib/user";
import Link from "next/link";
import AddContributionDialog from "./AddContributionDialog";
import PrimarySavingsProgressChart from "./PrimarySavingsProgressChart";
import SavingsGrowthChart from "./SavingsGrowthChart";
import SavingsPlanCreateDialog from "./SavingsPlanCreateDialog";

const toNumber = (value: unknown) => Number(value ?? 0);
type SearchParams = Promise<{ plan?: string | string[] | undefined }>;

const getPlanIcon = (name: string) => {
  const normalized = name.toLowerCase();

  if (/(emergency|reserve|safety)/.test(normalized)) {
    return "emergency";
  }
  if (/(travel|trip|tour|vacation|flight)/.test(normalized)) {
    return "flight_takeoff";
  }
  if (/(home|house|atelier|studio|property)/.test(normalized)) {
    return "home_work";
  }
  if (/(car|vehicle|bike)/.test(normalized)) {
    return "directions_car";
  }

  return "savings";
};

export default async function SavingsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  await materializeRecurringTransactions(user.id);
  const language = user.settings?.language || "en-US";
  const t = getDictionary(language);
  const currency = user.settings?.currency ?? "VND";
  const params = await searchParams;
  const requestedPlanId = Array.isArray(params.plan) ? params.plan[0] : params.plan;

  const [savingsPlans, savingsTransactions, wallets] = await Promise.all([
    prisma.savingsPlan.findMany({
      where: { userId: user.id },
      orderBy: [{ isPrimary: "desc" }, { targetAmount: "desc" }, { targetDate: "asc" }],
    }),
    prisma.transaction.findMany({
      where: { userId: user.id, savingsPlanId: { not: null } },
      select: {
        amount: true,
        type: true,
        date: true,
        savingsPlanId: true,
      },
      orderBy: { date: "asc" },
    }),
    prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const now = new Date();
  const growthPoints = Array.from({ length: 12 }, (_, index) => {
    const offset = 11 - index;
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const value = savingsTransactions
      .filter((tx) => tx.date >= monthStart && tx.date <= monthEnd)
      .reduce((sum, tx) => {
        const amount = toNumber(tx.amount);
        return sum + (tx.type === "expense" ? -amount : amount);
      }, 0);

    return {
      label: new Intl.DateTimeFormat(language === "vi-VN" ? "vi-VN" : "en-US", { month: "short" }).format(monthDate),
      value: Math.max(0, value),
    };
  });

  const plans = savingsPlans.map((plan) => {
    const saved = savingsTransactions
      .filter((tx) => tx.savingsPlanId === plan.id)
      .reduce((sum, tx) => {
        const amount = toNumber(tx.amount);
        return sum + (tx.type === "expense" ? -amount : amount);
      }, 0);
    const target = toNumber(plan.targetAmount);
    const progress = target > 0 ? (saved / target) * 100 : 0;

    return {
      id: plan.id,
      name: plan.name,
      status: plan.status,
      isPrimary: plan.isPrimary,
      target,
      saved: Math.max(0, saved),
      progress: Math.max(0, Math.min(progress, 100)),
      targetDate: plan.targetDate,
      monthlyContribution: toNumber(plan.monthlyContribution),
    };
  });

  const activePlans = plans.filter((plan) => plan.status === "active");
  const archivedPlans = plans.filter((plan) => plan.status === "archive");

  const primaryPlan =
    activePlans.find((plan) => plan.id === requestedPlanId) ||
    activePlans.find((plan) => plan.isPrimary) ||
    activePlans[0] ||
    null;

  const otherPlans = activePlans.filter((plan) => plan.id !== primaryPlan?.id);
  const totalSaved = plans.reduce((sum, plan) => sum + plan.saved, 0);
  const progressRatio = primaryPlan ? Math.max(0, Math.min(primaryPlan.progress, 100)) : 0;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#49636f]">{t.savingsPortfolio}</p>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-[-0.03em] text-[#1b3641] lg:text-5xl">
              {t.savingsTitle.split(" ")[0]} <span className="italic text-[#006f1d]">{t.savingsTitle.split(" ").slice(1).join(" ")}</span>
            </h1>
            {activePlans.length ? (
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[#9bb6c4]/30 bg-[#e7f6ff] px-4 py-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#49636f]">{t.savingsActivePlanLabel}</span>
                  <span className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">{primaryPlan?.name}</span>
                  <span className="material-symbols-outlined text-[18px] text-[#49636f]">expand_more</span>
                </summary>
                <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-[#9bb6c4]/20 bg-white p-2 shadow-2xl">
                  {activePlans.map((plan) => (
                    <Link
                      key={plan.id}
                      href={`/app/savings?plan=${plan.id}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-[#e7f6ff]"
                    >
                      <span className={plan.id === primaryPlan?.id ? "font-bold text-[#1b3641]" : "text-[#49636f]"}>{plan.name}</span>
                      {plan.id === primaryPlan?.id ? <span className="material-symbols-outlined text-[16px] text-[#006f1d]">check_circle</span> : null}
                    </Link>
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        </div>
        <div className="space-y-3">
          <SavingsPlanCreateDialog language={language} currency={currency} />
          <div className="rounded-[1.25rem] bg-[#e7f6ff] px-6 py-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t.savingsTotal}</p>
            <div className="mt-1 flex items-center gap-3">
              <p className="font-[var(--font-manrope)] text-2xl font-extrabold text-[#1b3641]">
                {formatCurrency(totalSaved, currency)}
              </p>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#91f78e] text-[#005e17]">
                <span className="material-symbols-outlined text-[20px]">trending_up</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {primaryPlan ? (
        <section className="relative overflow-hidden rounded-[2rem] bg-[#e7f6ff] p-8 md:p-10">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start">
            <PrimarySavingsProgressChart progress={progressRatio} />

            <div className="flex-1 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#006f1d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#eaffe2]">
                  {t.savingsPrimaryFocus}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#49636f]">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {t.savingsTargeted} {new Intl.DateTimeFormat(language === "vi-VN" ? "vi-VN" : "en-US", { month: "short", year: "numeric" }).format(primaryPlan.targetDate)}
                </span>
              </div>

              <AddContributionDialog
                language={language}
                currency={currency}
                plans={activePlans.map((plan) => ({ id: plan.id, name: plan.name, progress: plan.progress }))}
                wallets={wallets}
                defaultPlanId={primaryPlan.id}
              />

              <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-[-0.02em] text-[#1b3641] lg:text-4xl">
                {primaryPlan.name}
              </h2>
              <p className="max-w-2xl text-[#49636f]">
                {t.savingsPrimaryDesc}
              </p>

              <div className="grid gap-6 pt-2 sm:grid-cols-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t.savingsSaved}</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#006f1d]">
                    {formatCurrency(primaryPlan.saved, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t.savingsTarget}</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">
                    {formatCurrency(primaryPlan.target, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t.savingsRemaining}</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#49636f]">
                    {formatCurrency(Math.max(0, primaryPlan.target - primaryPlan.saved), currency)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#006f1d]/5 blur-3xl" />
        </section>
      ) : (
        <section className="rounded-[2rem] border-2 border-dashed border-[#c7dce9] bg-white p-12 text-center">
          <h2 className="font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">{t.savingsNoActivePlan}</h2>
          <p className="mt-2 text-[#647e8c]">{t.savingsNoActivePlanHint}</p>
          <div className="mt-5 inline-flex">
            <SavingsPlanCreateDialog language={language} currency={currency} />
          </div>
        </section>
      )}

      <SavingsGrowthChart currency={currency} points={growthPoints} />

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-[-0.02em] text-[#1b3641]">{t.savingsOtherAmbitions}</h3>
          {archivedPlans.length ? (
            <p className="rounded-full bg-[#d4ecf9] px-3 py-1 text-[11px] font-bold text-[#40555f]">{t.savingsArchivedCount.replace("{count}", String(archivedPlans.length))}</p>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {otherPlans.slice(0, 2).map((plan) => (
            <article
              key={plan.id}
              className="rounded-[2rem] border border-transparent bg-white p-8 shadow-[0_4px_24px_rgba(27,54,65,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#006f1d]/10"
            >
              <div className="mb-7 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#cfe6f2] text-[#40555f]">
                  <span className="material-symbols-outlined text-2xl">{getPlanIcon(plan.name)}</span>
                </div>
                <span className="rounded-full bg-[#e7f6ff] px-3 py-1 text-[11px] font-black text-[#1b3641]">
                  {Math.round(plan.progress)}%
                </span>
              </div>

              <h4 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{plan.name}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[#647e8c]">
                {t.savingsMonthlyContributionTarget}: {formatCurrency(plan.monthlyContribution, currency)}.
              </p>

              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-[#e7f6ff]">
                <div className="h-full rounded-full bg-[#4d626c]" style={{ width: `${Math.round(plan.progress)}%` }} />
              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-[#647e8c]">
                <span>{formatCurrency(plan.saved, currency)}</span>
                <span>{formatCurrency(plan.target, currency)} {t.savingsTarget.toLowerCase()}</span>
              </div>
            </article>
          ))}

          <SavingsPlanCreateDialog language={language} currency={currency} variant="card" />
        </div>
      </section>
    </div>
  );
}
