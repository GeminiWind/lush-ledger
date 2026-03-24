"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";

type Props = {
  wallet: {
    id: string;
    name: string;
    type: string;
    balance: number;
  };
  currency: string;
  language: string;
  icon: string;
};

const toPlainNumber = (value: string) => {
  const normalized = value.replaceAll(",", "").replaceAll(".", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function MainWalletCard({ wallet, currency, language, icon }: Props) {
  const router = useRouter();
  const t = getDictionary(language);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Math.max(0, Math.round(wallet.balance))));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSave = async () => {
    setError(null);
    const balance = toPlainNumber(value);
    if (!Number.isFinite(balance) || balance < 0) {
      setError(t.walletInvalidBalance);
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/accounts/${wallet.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || t.walletUpdateFailed);
      return;
    }

    setEditing(false);
    router.refresh();
  };

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

        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing((state) => !state);
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-white/70 px-3 py-2 text-[#49636f] transition-colors hover:text-[#1b3641]"
          aria-label={t.walletEditAria}
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
          <span className="text-xs font-semibold">{t.walletEdit}</span>
        </button>
      </div>

      <div className="relative z-10 mt-12 space-y-4">
        <h2 className="font-[var(--font-manrope)] text-5xl font-black tracking-tighter text-[#1b3641]">
          {formatCurrency(wallet.balance, currency)}
        </h2>

        {editing ? (
          <div className="max-w-sm rounded-2xl border border-[#c4dce9] bg-white/90 p-4">
            <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">
              {t.walletSetCurrentBalance}
            </label>
            <div className="flex gap-2">
              <input
                value={value}
                onChange={(event) => setValue(event.target.value)}
                inputMode="numeric"
                placeholder="0"
                className="w-full rounded-xl border-none bg-[#e7f6ff] px-4 py-2.5 text-sm text-[#1b3641] outline-none ring-2 ring-transparent focus:ring-[#006f1d]/25"
              />
              <button
                type="button"
                onClick={onSave}
                disabled={loading}
                className="rounded-xl bg-[#006f1d] px-4 py-2 text-xs font-bold text-[#eaffe2] disabled:opacity-70"
              >
                  {loading ? t.walletSaving : t.walletSave}
                </button>
            </div>
            {error ? <p className="mt-2 text-xs text-[#a73b21]">{error}</p> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
