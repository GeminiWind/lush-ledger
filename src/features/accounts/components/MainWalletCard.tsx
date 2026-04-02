"use client";

import WalletCreateForm from "@/features/accounts/components/WalletCreateForm";
import { formatCurrency } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import type { MainWalletCardProps } from "@/features/accounts/types";

export default function MainWalletCard({ wallet, currency, language, icon }: MainWalletCardProps) {
  const t = getDictionary(language);

  return (
    <article className="relative flex min-h-[360px] flex-col justify-between overflow-hidden rounded-[2rem] bg-[#e7f6ff] p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/5 md:col-span-7">
      <div className="pointer-events-none absolute right-[-84px] top-[-84px] h-64 w-64 rounded-full bg-[#006f1d]/5 blur-3xl" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-2xl bg-[#006f1d]/10 p-3 text-[#006f1d]">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
            </span>
            <span className="text-xl font-bold tracking-tight text-[#1b3641]">{wallet.name}</span>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#91f78e]/40 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#005e17] shadow-sm">
            <span className="material-symbols-outlined text-[14px]">verified</span>
            {t.walletDefaultBadge}
          </span>
        </div>

        <WalletCreateForm
          language={language}
          currency={currency}
          trigger="icon"
          wallet={{
            id: wallet.id,
            name: wallet.name,
            openingBalance: wallet.openingBalance,
            isDefault: wallet.isDefault,
          }}
        />
      </div>

      <div className="relative z-10 mt-12 space-y-4">
        <h2 className="font-[var(--font-manrope)] text-5xl font-black tracking-tighter text-[#1b3641]">
          {formatCurrency(wallet.balance, currency)}
        </h2>
      </div>
    </article>
  );
}
