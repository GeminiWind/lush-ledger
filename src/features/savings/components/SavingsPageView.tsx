import { addMonthsDate, endOfMonthDate, localeDateLabel, nowDate, startOfMonthDate } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import Link from "next/link";
import AddContributionDialog from "@/features/savings/dialogs/AddContributionDialog";
import EditSavingsPlanDialog from "@/features/savings/dialogs/EditSavingsPlanDialog";
import PrimarySavingsProgressChart from "@/features/savings/components/PrimarySavingsProgressChart";
import SavingsPlanStateButton from "@/features/savings/components/SavingsPlanStateButton";
import SavingsGrowthChart from "@/features/savings/components/SavingsGrowthChart";
import SavingsPlanCreateDialog from "@/features/savings/dialogs/SavingsPlanCreateDialog";
import SavingsFilterDropdown from "@/features/savings/components/SavingsFilterDropdown";

const toNumber = (value: unknown) => Number(value ?? 0);

type SavingsFilter = "active" | "completed" | "archived" | "cancelled";

type Props = {
  language: string;
  currency: string;
  activeFilter: SavingsFilter;
  requestedPlanId?: string;
  savingsPlans: Array<{
    id: string;
    name: string;
    icon: string | null;
    status: string;
    isPrimary: boolean;
    targetAmount: unknown;
    targetDate: Date;
    createdAt: Date;
    monthlyContribution: unknown;
  }>;
  savingsTransactions: Array<{
    amount: unknown;
    type: string;
    date: Date;
    savingsPlanId: string | null;
  }>;
  wallets: Array<{ id: string; name: string }>;
};

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

const getPlanStatusLabel = (status: string, t: ReturnType<typeof getDictionary>) => {
  if (status === "completed") {
    return t.savingsPlanStatusCompleted;
  }
  if (status === "funded") {
    return t.savingsPlanStatusFunded;
  }
  if (status === "cancelled") {
    return t.savingsPlanStatusCancelled;
  }
  if (status === "archive") {
    return t.savingsPlanStatusArchived;
  }
  return t.savingsPlanStatusActive;
};

const getPlanStatusClass = (status: string) => {
  if (status === "completed") {
    return "bg-[#eaffe2] text-[#006f1d] border border-[#c9f8c8]";
  }
  if (status === "funded") {
    return "bg-[#e7f6ff] text-[#1b3641] border border-[#cbe7f6]";
  }
  if (status === "cancelled") {
    return "bg-[#fff3ef] text-[#a73b21] border border-[#f8cfc4]";
  }
  if (status === "archive") {
    return "bg-[#d4ecf9] text-[#49636f] border border-[#c7dce9]";
  }
  return "bg-[#e7f6ff] text-[#49636f] border border-[#cbe7f6]";
};

export default function SavingsPageView({
  language,
  currency,
  activeFilter,
  requestedPlanId,
  savingsPlans,
  savingsTransactions,
  wallets,
}: Props) {
  const t = getDictionary(language);

  const plans = savingsPlans.map((plan) => {
    const saved = savingsTransactions
      .filter((tx) => tx.savingsPlanId === plan.id)
      .reduce((sum, tx) => {
        const amount = toNumber(tx.amount);
        return sum + (tx.type === "expense" || tx.type === "refund" ? -amount : amount);
      }, 0);
    const target = toNumber(plan.targetAmount);
    const progress = target > 0 ? (saved / target) * 100 : 0;

    return {
      id: plan.id,
      name: plan.name,
      icon: plan.icon || undefined,
      status: plan.status,
      effectiveStatus:
        plan.status === "active"
          ? Math.max(0, saved) >= target
            ? "completed"
            : Math.max(0, saved) > 0
              ? "funded"
              : "active"
          : plan.status,
      isPrimary: plan.isPrimary,
      target,
      saved: Math.max(0, saved),
      progress: Math.max(0, Math.min(progress, 100)),
      targetDate: plan.targetDate,
      createdAt: plan.createdAt,
      monthlyContribution: toNumber(plan.monthlyContribution),
    };
  });

  const sortLatest = <T extends { createdAt: Date }>(items: T[]) =>
    items.slice().sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  const activePlans = sortLatest(plans.filter((plan) => plan.status === "active"));
  const completedPlans = sortLatest(activePlans.filter((plan) => plan.effectiveStatus === "completed"));
  const archivedPlans = sortLatest(plans.filter((plan) => plan.status === "archive"));
  const activeFundedPlans = activePlans.filter((plan) => plan.effectiveStatus === "active" || plan.effectiveStatus === "funded");

  const plansByFilter =
    activeFilter === "archived"
      ? archivedPlans
      : activeFilter === "completed"
        ? completedPlans
        : activePlans;

  const primaryPlan =
    plansByFilter.find((plan) => plan.id === requestedPlanId) ||
    (activeFilter === "active" ? activePlans.find((plan) => plan.isPrimary) : undefined) ||
    plansByFilter[0] ||
    null;

  const filteredOtherPlans = plansByFilter.filter((plan) => plan.id !== primaryPlan?.id);
  const isCompletedOrArchivedEmpty =
    (activeFilter === "completed" || activeFilter === "archived") && plansByFilter.length === 0;

  const chartTransactions = primaryPlan
    ? savingsTransactions.filter((tx) => tx.savingsPlanId === primaryPlan.id)
    : [];

  const now = nowDate();
  const growthPoints = Array.from({ length: 12 }, (_, index) => {
    const offset = 11 - index;
    const monthDate = startOfMonthDate(addMonthsDate(now, -offset));
    const monthStart = startOfMonthDate(monthDate);
    const monthEnd = endOfMonthDate(monthDate);

    const value = chartTransactions
      .filter((tx) => tx.date >= monthStart && tx.date <= monthEnd)
      .reduce((sum, tx) => {
        const amount = toNumber(tx.amount);
        return sum + (tx.type === "expense" || tx.type === "refund" ? -amount : amount);
      }, 0);

    return {
      label: localeDateLabel(monthDate, language === "vi-VN" ? "vi-VN" : "en-US", { month: "short" }),
      value: Math.max(0, value),
    };
  });

  const otherActivePlans = activePlans.filter((plan) => plan.id !== primaryPlan?.id && plan.effectiveStatus !== "completed");
  const otherCompletedPlans = completedPlans.filter((plan) => plan.id !== primaryPlan?.id);
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
            {plans.length ? (
              <SavingsFilterDropdown
                currentFilter={activeFilter}
                requestedPlanId={requestedPlanId}
              />
            ) : null}
          </div>
        </div>
        <div className="space-y-3">
          <SavingsPlanCreateDialog />
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
                {primaryPlan.isPrimary ? (
                  <span className="rounded-full bg-[#006f1d] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#eaffe2]">
                    {t.savingsPrimaryFocus}
                  </span>
                ) : null}
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${getPlanStatusClass(primaryPlan.effectiveStatus)}`}>
                  {getPlanStatusLabel(primaryPlan.effectiveStatus, t)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-[#49636f]">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  {t.savingsTargeted} {localeDateLabel(primaryPlan.targetDate, language === "vi-VN" ? "vi-VN" : "en-US", { month: "short", year: "numeric" })}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {primaryPlan.effectiveStatus === "active" || primaryPlan.effectiveStatus === "funded" ? (
                    <SavingsPlanStateButton
                      planId={primaryPlan.id}
                      planName={primaryPlan.name}
                      status={primaryPlan.effectiveStatus}
                    />
                  ) : null}
                  {primaryPlan.effectiveStatus === "active" || primaryPlan.effectiveStatus === "funded" ? (
                    <AddContributionDialog
                      plans={activeFundedPlans.map((plan) => ({ id: plan.id, name: plan.name, progress: plan.progress }))}
                      wallets={wallets}
                      defaultPlanId={primaryPlan.id}
                    />
                  ) : null}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-[-0.02em] text-[#1b3641] lg:text-4xl">
                  {primaryPlan.name}
                </h2>
                {primaryPlan.effectiveStatus === "active" || primaryPlan.effectiveStatus === "funded" ? (
                  <EditSavingsPlanDialog
                    plan={primaryPlan}
                    trigger="primary"
                  />
                ) : primaryPlan.effectiveStatus === "completed" ? (
                  <SavingsPlanStateButton
                    planId={primaryPlan.id}
                    planName={primaryPlan.name}
                    status={primaryPlan.effectiveStatus}
                    compact
                  />
                ) : null}
              </div>
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
      ) : isCompletedOrArchivedEmpty ? (
        <section className="rounded-2xl border border-dashed border-[#c7dce9] bg-white px-4 py-10 text-center text-sm text-[#647e8c]">
          {t.savingsNoPlan}
        </section>
      ) : (
        <section className="rounded-[2rem] border-2 border-dashed border-[#c7dce9] bg-white p-12 text-center">
          <h2 className="font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">{t.savingsNoActivePlan}</h2>
          <p className="mt-2 text-[#647e8c]">{t.savingsNoActivePlanHint}</p>
          <div className="mt-5 inline-flex">
            <SavingsPlanCreateDialog />
          </div>
        </section>
      )}

      {!isCompletedOrArchivedEmpty ? <SavingsGrowthChart points={growthPoints} /> : null}

      {!isCompletedOrArchivedEmpty ? (
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-[-0.02em] text-[#1b3641]">{t.savingsOtherAmbitions}</h3>
          <div className="flex items-center gap-2">
            {archivedPlans.length ? (
              <p className="rounded-full bg-[#d4ecf9] px-3 py-1 text-[11px] font-bold text-[#40555f]">{t.savingsArchivedCount.replace("{count}", String(archivedPlans.length))}</p>
            ) : null}
            <Link href="/app/savings/cancelled" className="rounded-full border border-[#cbe7f6] bg-white px-3 py-1 text-[11px] font-bold text-[#006f1d] hover:bg-[#f5fcff]">
              {t.savingsCancelledHistoryOpenLedger}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {(activeFilter === "archived"
            ? filteredOtherPlans
            : activeFilter === "completed"
              ? otherCompletedPlans
              : otherActivePlans
          )
            .slice(0, 2)
            .map((plan) => (
            <Link
              key={plan.id}
              href={plan.status === "cancelled" ? `/app/savings/cancelled/${plan.id}` : `/app/savings?plan=${plan.id}&filter=${activeFilter}`}
              className="block rounded-[2rem] border border-transparent bg-white p-8 shadow-[0_4px_24px_rgba(27,54,65,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#006f1d]/10"
            >
              <article>
                <div className="mb-7 flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#cfe6f2] text-[#40555f]">
                    <span className="material-symbols-outlined text-2xl">{plan.icon || getPlanIcon(plan.name)}</span>
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
            </Link>
          ))}

          {activeFilter !== "archived" ? (
            <SavingsPlanCreateDialog variant="card" />
          ) : null}
        </div>
      </section>
      ) : null}
    </div>
  );
}
