import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { getMonthRange } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { ensureMonthlyCapSnapshot } from "@/lib/monthly-cap";

const toNumber = (value: unknown) => Number(value ?? 0);

export default async function OverviewPage() {
  const user = await requireUser();
  const { start, end } = getMonthRange(new Date());
  const currency = user.settings?.currency || "VND";
  await ensureMonthlyCapSnapshot(user.id, start);

  const [accounts, categories, monthTransactions, savingsPlans, monthLimits] =
    await Promise.all([
      prisma.account.findMany({ where: { userId: user.id } }),
      prisma.category.findMany({ where: { userId: user.id } }),
      prisma.transaction.findMany({
        where: { userId: user.id, date: { gte: start, lte: end } },
      }),
      prisma.savingsPlan.findMany({ where: { userId: user.id } }),
      prisma.categoryMonthlyLimit.findMany({
        where: { userId: user.id, monthStart: start },
        select: { categoryId: true, limit: true },
      }),
    ]);
  const monthLimitByCategoryId = new Map(monthLimits.map((item) => [item.categoryId, toNumber(item.limit)]));

  const accountBalances = accounts.map((account) => {
    const total = monthTransactions
      .filter((tx) => tx.accountId === account.id)
      .reduce((sum, tx) => sum + toNumber(tx.amount) * (tx.type === "expense" ? -1 : 1), 0);
    return {
      ...account,
      balance: toNumber(account.openingBalance) + total,
    };
  });

  const monthIncome = monthTransactions
    .filter((tx) => tx.type === "income")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
  const monthExpense = monthTransactions
    .filter((tx) => tx.type === "expense")
    .reduce((sum, tx) => sum + toNumber(tx.amount), 0);

  const categoryWarnings = categories
    .filter((category) => (monthLimitByCategoryId.get(category.id) ?? 0) > 0)
    .map((category) => {
      const spent = monthTransactions
        .filter((tx) => tx.categoryId === category.id && tx.type === "expense")
        .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
      return {
        id: category.id,
        name: category.name,
        spent,
        limit: monthLimitByCategoryId.get(category.id) ?? 0,
      };
    })
    .filter((item) => item.spent > item.limit);

  const savingsProgress = savingsPlans.map((plan) => {
    const saved = monthTransactions
      .filter((tx) => tx.savingsPlanId === plan.id)
      .reduce((sum, tx) => sum + toNumber(tx.amount), 0);
    return {
      ...plan,
      saved,
    };
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            This month income
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-300">
            {formatCurrency(monthIncome, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            This month expenses
          </p>
          <p className="mt-2 text-2xl font-semibold text-rose-300">
            {formatCurrency(monthExpense, currency)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Net cashflow
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-300">
            {formatCurrency(monthIncome - monthExpense, currency)}
          </p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold">Account balances</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {accountBalances.length === 0 ? (
              <p className="text-slate-500">No accounts yet.</p>
            ) : (
              accountBalances.map((account) => (
                <div key={account.id} className="flex justify-between">
                  <span>{account.name}</span>
                  <span>{formatCurrency(account.balance, currency)}</span>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold">Over-limit alerts</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            {categoryWarnings.length === 0 ? (
              <p className="text-slate-500">All categories within limits.</p>
            ) : (
              categoryWarnings.map((warning) => (
                <div key={warning.id} className="flex justify-between text-rose-200">
                  <span>{warning.name}</span>
                  <span>
                    {formatCurrency(warning.spent, currency)} /{" "}
                    {formatCurrency(warning.limit, currency)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-lg font-semibold">Savings plans</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {savingsProgress.length === 0 ? (
            <p className="text-slate-500">No savings plans created yet.</p>
          ) : (
            savingsProgress.map((plan) => (
              <div key={plan.id} className="flex justify-between">
                <span>{plan.name}</span>
                <span>
                  {formatCurrency(plan.saved, currency)} /{" "}
                  {formatCurrency(Number(plan.targetAmount), currency)}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
