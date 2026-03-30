"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import toast from "react-hot-toast";

type Props = {
  currency: string;
  language: string;
  month: string;
  totalCap: number;
  allocated: number;
  remaining: number;
  monthIncome: number;
  capProgress: number;
};

const parseCapValue = (value: string) => {
  const normalized = value.replaceAll(",", "").replaceAll(".", "").trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function TotalCapCard({
  currency,
  language,
  month,
  totalCap,
  allocated,
  remaining,
  monthIncome,
  capProgress,
}: Props) {
  const router = useRouter();
  const t = getDictionary(language);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Math.max(0, Math.round(totalCap))));
  const [keepCapNextMonth, setKeepCapNextMonth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCap = async (options?: { overrideCap?: number; keepCapNextMonth?: boolean }) => {
    setError(null);
    const nextCap = options?.overrideCap ?? parseCapValue(value);
    const nextKeep = options?.keepCapNextMonth ?? keepCapNextMonth;

    if (!Number.isFinite(nextCap) || nextCap < 0) {
      setError(t.atelierCapInvalidValue);
      return false;
    }

    setLoading(true);
    const response = await fetch("/api/atelier/cap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalCap: nextCap, month, keepCapNextMonth: nextKeep }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || t.atelierCapUpdateFailed);
      return false;
    }

    setEditing(false);
    toast.success(t.atelierCapUpdateSuccess);
    router.refresh();
    return true;
  };

  return (
    <article className="rounded-[2rem] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(27,54,65,0.08)] lg:p-10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#49636f]">{t.atelierTotalMonthlyCap}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing((state) => !state);
          }}
            className="inline-flex items-center gap-1 rounded-lg bg-[#eef7ff] px-2.5 py-1.5 text-[#49636f] transition hover:text-[#1b3641] disabled:opacity-70"
            aria-label={t.atelierEditTotalMonthlyCapAria}
            disabled={loading}
          >
            <span className="material-symbols-outlined text-[16px]">edit</span>
            <span className="text-xs font-semibold">{t.atelierActionEdit}</span>
          </button>
        </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        {editing ? (
          <>
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              inputMode="numeric"
              autoFocus
              className="w-[280px] rounded-xl border-none bg-[#f3fbf6] px-4 py-2 font-[var(--font-manrope)] text-4xl font-extrabold tracking-[-0.03em] text-[#2e7d32] outline-none ring-2 ring-[#2e7d32]/25 sm:text-5xl"
            />
            <button
              type="button"
              onClick={() => {
                void saveCap();
              }}
              disabled={loading}
              className="rounded-xl bg-[#006f1d] px-4 py-2 text-xs font-bold text-[#eaffe2] disabled:opacity-70"
            >
              {loading ? t.atelierActionSaving : t.atelierActionSave}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setError(null);
                setValue(String(Math.max(0, Math.round(totalCap))));
              }}
              className="rounded-xl bg-[#e7f6ff] px-4 py-2 text-xs font-bold text-[#1b3641]"
            >
              {t.atelierActionCancel}
            </button>
          </>
        ) : (
          <p className="font-[var(--font-manrope)] text-5xl font-extrabold tracking-[-0.03em] text-[#2e7d32] sm:text-6xl">
            {formatCurrency(totalCap, currency)}
          </p>
        )}
      </div>

      {error ? <p className="mt-2 text-xs text-[#a73b21]">{error}</p> : null}

      <div className="mt-8 h-4 overflow-hidden rounded-full bg-[#e4f1fa]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#2e7d32] to-[#145322]"
          style={{ width: `${Math.round(capProgress * 100)}%` }}
        />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t.atelierAllocated}</p>
          <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">
            {formatCurrency(allocated, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t.atelierRemaining}</p>
          <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#2e7d32]">
            {formatCurrency(remaining, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{t.atelierThisMonthIncome}</p>
          <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">
            {formatCurrency(monthIncome, currency)}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-start justify-between gap-3 rounded-xl bg-[#f7fcff] px-4 py-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#49636f]">{t.atelierKeepCapNextMonth}</p>
          <p className="mt-1 max-w-[420px] text-[11px] leading-relaxed text-[#7b939f]">{t.atelierKeepCapNextMonthHint}</p>
        </div>
        <button
          type="button"
          onClick={async () => {
            const prevValue = keepCapNextMonth;
            const nextValue = !keepCapNextMonth;
            setKeepCapNextMonth(nextValue);
            const currentCap = parseCapValue(value);
            const ok = await saveCap({
              overrideCap: Number.isFinite(currentCap) ? currentCap : Math.max(0, Math.round(totalCap)),
              keepCapNextMonth: nextValue,
            });
            if (!ok) {
              setKeepCapNextMonth(prevValue);
            }
          }}
          disabled={loading}
          className={`relative mt-0.5 inline-flex h-6 w-11 items-center rounded-full transition ${
            keepCapNextMonth ? "bg-[#2e7d32]" : "bg-[#9bb6c4]"
          } disabled:opacity-70`}
          aria-pressed={keepCapNextMonth}
          aria-label={t.atelierKeepCapNextMonth}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              keepCapNextMonth ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </article>
  );
}
