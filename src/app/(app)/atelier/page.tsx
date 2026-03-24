import Image from "next/image";
import { prisma } from "@/lib/db";
import { getMonthRange } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { requireUser } from "@/lib/user";

const toNumber = (value: unknown) => Number(value ?? 0);

const categoryTones = [
  {
    icon: "DI",
    badge: "bg-emerald-50 text-emerald-800",
    meter: "bg-emerald-700",
  },
  {
    icon: "HO",
    badge: "bg-sky-50 text-sky-800",
    meter: "bg-sky-700",
  },
  {
    icon: "GR",
    badge: "bg-amber-50 text-amber-800",
    meter: "bg-amber-700",
  },
];

export default async function AtelierPage() {
  const user = await requireUser();
  const currency = user.settings?.currency || "VND";
  const { start, end } = getMonthRange(new Date());

  const [categories, monthTransactions, savingsPlans] = await Promise.all([
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
  ]);

  const monthIncome = monthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
  const monthExpense = monthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const categoryStats = categories
    .map((category) => {
      const spent = monthTransactions
        .filter((tx) => tx.categoryId === category.id && tx.type === "expense")
        .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

      const limit = toNumber(category.monthlyLimit);
      const usage = limit > 0 ? Math.min(spent / limit, 1) : 0;

      return {
        id: category.id,
        name: category.name,
        limit,
        spent,
        usage,
      };
    })
    .sort((a, b) => b.limit - a.limit || b.spent - a.spent);

  const totalCap = categoryStats.reduce((sum, category) => sum + category.limit, 0);
  const allocated = monthExpense;
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

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f4faff] text-[#1b3641]">
      <header className="sticky top-0 z-20 border-b border-[#d8e8f3] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="w-full max-w-md">
            <input
              type="search"
              placeholder="Search curator tools..."
              className="w-full rounded-full border border-[#d7e8f3] bg-[#eef7ff] px-4 py-2.5 text-sm text-[#1b3641] outline-none transition focus:border-[#2e7d32]/40 focus:ring-2 focus:ring-[#2e7d32]/20"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-xs uppercase tracking-[0.15em] text-[#6f8793]">Curator</p>
              <p className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">
                {user.name || user.email}
              </p>
            </div>
            <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-[#d7e8f3] bg-[#dfeef8]">
              <Image
                src="/images/app/fiscal-atelier-avatar.png"
                alt="User avatar"
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-8 lg:px-10 lg:py-10">
        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#49636f]">Fiscal Masterplan</p>
              <h1 className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-[-0.02em] text-[#1b3641]">
                Budget Allocation
              </h1>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">Period</p>
              <p className="font-[var(--font-manrope)] text-xl font-bold text-[#2e7d32]">{monthLabel}</p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <article className="rounded-[2rem] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(27,54,65,0.08)] lg:p-10">
              <p className="text-sm font-semibold text-[#49636f]">Total Monthly Cap</p>
              <div className="mt-3 flex flex-wrap items-end gap-3">
                <p className="font-[var(--font-manrope)] text-5xl font-extrabold tracking-[-0.03em] text-[#2e7d32] sm:text-6xl">
                  {formatCurrency(totalCap, currency)}
                </p>
              </div>

              <div className="mt-8 h-4 overflow-hidden rounded-full bg-[#e4f1fa]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2e7d32] to-[#145322]"
                  style={{ width: `${Math.round(capProgress * 100)}%` }}
                />
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">Allocated</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">
                    {formatCurrency(allocated, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">Remaining</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#2e7d32]">
                    {formatCurrency(remaining, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">This Month Income</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">
                    {formatCurrency(monthIncome, currency)}
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-[2rem] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(27,54,65,0.08)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-[var(--font-manrope)] text-xl font-bold">Monthly Savings Plan</h2>
                  <p className="text-xs text-[#49636f]">Automatic Vault Allocation</p>
                </div>
                <div className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  ON
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">Savings Target</p>
                  <p className="mt-1 font-[var(--font-manrope)] text-3xl font-extrabold text-[#1b3641]">
                    {formatCurrency(savingsTarget, currency)}
                  </p>
                </div>

                <div className="space-y-2">
                  {savingsByPlan.length === 0 ? (
                    <p className="text-sm text-[#6f8793]">No savings plans yet.</p>
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
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">Goal Coverage</p>
                    <p className="font-[var(--font-manrope)] text-sm font-bold text-[#2e7d32]">
                      {Math.round(savingsCoverage)}% Covered
                    </p>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-[#e4f1fa]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2e7d32] to-[#1f6f3a]"
                      style={{ width: `${Math.round(savingsCoverage)}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#6f8793]">
                    Saved this month: <span className="font-semibold text-[#1b3641]">{formatCurrency(savingsSaved, currency)}</span>
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">Category Atelier</h2>
            <div className="flex items-center gap-2">
              <button className="rounded-full bg-[#dff0fa] px-4 py-2 text-xs font-bold text-[#49636f]">
                By Magnitude
              </button>
              <button className="rounded-full bg-[#2e7d32] px-4 py-2 text-xs font-bold text-[#eaffe2]">
                Custom Order
              </button>
            </div>
          </div>

          {categoryStats.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-[#c7dce9] bg-white p-12 text-center text-[#6f8793]">
              Add categories with monthly limits to start your atelier view.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {categoryStats.slice(0, 3).map((category, index) => {
                const tone = categoryTones[index % categoryTones.length];
                const usedPercent = Math.round(category.usage * 100);
                const atLimit = category.limit > 0 && category.spent >= category.limit;

                return (
                  <article
                    key={category.id}
                    className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-[0_16px_38px_-14px_rgba(27,54,65,0.16)]"
                  >
                    <div>
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold ${tone.badge}`}>
                            {tone.icon}
                          </div>
                          <div>
                            <h3 className="font-[var(--font-manrope)] text-lg font-bold text-[#1b3641]">
                              {category.name}
                            </h3>
                            <p className="text-xs text-[#6f8793]">Monthly Limit</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-end justify-between gap-4">
                          <p className="font-[var(--font-manrope)] text-2xl font-extrabold text-[#1b3641]">
                            {formatCurrency(category.limit, currency)}
                          </p>
                          <span className="rounded-md bg-[#eef7ff] px-2 py-1 text-xs font-bold text-[#49636f]">
                            {usedPercent}% Used
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-[#e4f1fa]">
                          <div
                            className={`h-full rounded-full ${tone.meter}`}
                            style={{ width: `${usedPercent}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.16em] text-[#8aa2b0]">
                          <span>Spent: {formatCurrency(category.spent, currency)}</span>
                          <span className={atLimit ? "text-[#a73b21]" : "text-[#49636f]"}>
                            {atLimit ? "Fully Allocated" : "Healthy"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
