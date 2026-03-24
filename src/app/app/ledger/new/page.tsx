import NewEntryForm from "@/app/app/ledger/new/NewEntryForm";
import { prisma } from "@/lib/db";
import { getDictionary } from "@/lib/i18n";
import { requireUser } from "@/lib/user";
import { ensureDefaultWallet } from "@/lib/wallet";

export default async function NewLedgerEntryPage() {
  const user = await requireUser();
  const currency = user.settings?.currency ?? "VND";
  const language = user.settings?.language || "en-US";
  const t = getDictionary(language);

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
        <span className="font-[var(--font-manrope)] text-base text-[#7f97a4]">{t.newEntryBreadcrumb} /</span>
        <span className="font-[var(--font-manrope)] text-base font-bold text-[#1b3641]">{t.newEntryTitle}</span>
      </div>

      <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <aside className="space-y-6 lg:col-span-4">
          <div className="space-y-4 rounded-[2rem] bg-[#e7f6ff] p-8">
            <span className="inline-flex rounded-full bg-[#91f78e] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#005e17]">
              {t.newEntryHeroTag}
            </span>
            <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold leading-tight text-[#1b3641]">
              {t.newEntryHeroHeading}
            </h2>
            <p className="text-sm leading-relaxed text-[#49636f]">
              {t.newEntryHeroBody}
            </p>
          </div>

          <div className="space-y-4 rounded-xl border border-[#cbe0ec] bg-white p-6">
            <h3 className="flex items-center gap-2 font-[var(--font-manrope)] font-bold text-[#1b3641]">
              <span className="material-symbols-outlined text-[#006f1d]">tips_and_updates</span>
              <span>{t.newEntryTipTitle}</span>
            </h3>
            <p className="text-xs text-[#6f8793]">
              {t.newEntryTipBody}
            </p>
          </div>
        </aside>

        <section className="rounded-[2.5rem] bg-white p-8 shadow-[0_32px_80px_-20px_rgba(27,54,65,0.08)] sm:p-10 lg:col-span-8">
          <NewEntryForm
            categories={categories}
            wallets={wallets}
            defaultWalletId={defaultWalletId}
            currency={currency}
            language={language}
          />
        </section>
      </div>
    </div>
  );
}
