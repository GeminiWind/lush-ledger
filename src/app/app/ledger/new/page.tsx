import NewEntryForm from "@/app/app/ledger/new/NewEntryForm";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { ensureDefaultWallet } from "@/lib/wallet";

export default async function NewLedgerEntryPage() {
  const user = await requireUser();
  const currency = user.settings?.currency ?? "VND";

  await ensureDefaultWallet(user.id);

  const [categories, wallets] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const defaultWalletId = wallets[0]?.id || "";

  return (
    <div className="relative min-h-[calc(100vh-180px)]">
      <div className="pointer-events-none absolute right-[-6%] top-[-25%] -z-10 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-emerald-100/50 to-transparent blur-[120px]" />

      <div className="mb-8 flex items-center space-x-3 px-1">
        <span className="font-[var(--font-manrope)] text-base text-[#7f97a4]">Journal /</span>
        <span className="font-[var(--font-manrope)] text-base font-bold text-[#1b3641]">New Transaction</span>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <div className="space-y-4 rounded-[2rem] bg-[#e7f6ff] p-8">
            <span className="inline-flex rounded-full bg-[#91f78e] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#005e17]">
              Entry Mode
            </span>
            <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold leading-tight text-[#1b3641]">
              Documenting Growth.
            </h2>
            <p className="text-sm leading-relaxed text-[#49636f]">
              Every transaction is a stitch in the fabric of your financial atelier. Be precise, be intentional.
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-[#cbe0ec] bg-white p-6">
            <h3 className="flex items-center gap-2 font-[var(--font-manrope)] font-bold text-[#1b3641]">
              <span className="material-symbols-outlined text-[#006f1d]">tips_and_updates</span>
              <span>Atelier Tip</span>
            </h3>
            <p className="text-xs text-[#6f8793]">
              Attach clear descriptions to improve report insights and make your spending patterns easier to review.
            </p>
          </div>
        </aside>

        <section className="rounded-[2.5rem] bg-white p-8 shadow-[0_32px_80px_-20px_rgba(27,54,65,0.08)] sm:p-10 lg:col-span-8">
          <NewEntryForm
            categories={categories}
            wallets={wallets}
            defaultWalletId={defaultWalletId}
            currency={currency}
          />
        </section>
      </div>
    </div>
  );
}
