import AccountForm from "@/app/(app)/accounts/AccountForm";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { formatCurrency } from "@/lib/format";

export default async function AccountsPage() {
  const user = await requireUser();
  const currency = user.settings?.currency || "VND";
  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h1 className="text-lg font-semibold">Wallets</h1>
        <p className="text-sm text-slate-400">
          Track every wallet you use for income and expenses.
        </p>
        <div className="mt-6">
          <AccountForm />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-base font-semibold">Current wallets</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-300">
          {accounts.length === 0 ? (
            <p className="text-slate-500">No wallets yet.</p>
          ) : (
            accounts.map((account) => (
              <div key={account.id} className="flex justify-between">
                <span>
                  {account.name} · {account.type}
                </span>
                <span>{formatCurrency(Number(account.openingBalance), currency)}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
