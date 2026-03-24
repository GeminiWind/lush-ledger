"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";
import { tr } from "@/lib/i18n";

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
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(Math.max(0, Math.round(totalCap))));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCap = async () => {
    setError(null);
    const nextCap = parseCapValue(value);
    if (!Number.isFinite(nextCap) || nextCap < 0) {
      setError(tr(language, "Please enter a valid cap value.", "Vui lòng nhập hạn mức hợp lệ."));
      return;
    }

    setLoading(true);
    const response = await fetch("/api/atelier/cap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalCap: nextCap, month }),
    });
    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      setError(data.error || tr(language, "Unable to update total monthly cap.", "Không thể cập nhật tổng hạn mức tháng."));
      return;
    }

    setEditing(false);
    router.refresh();
  };

  return (
    <article className="rounded-[2rem] bg-white p-8 shadow-[0_24px_48px_-12px_rgba(27,54,65,0.08)] lg:p-10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[#49636f]">{tr(language, "Total Monthly Cap", "Tổng hạn mức tháng")}</p>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setEditing((state) => !state);
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-[#eef7ff] px-2.5 py-1.5 text-[#49636f] transition hover:text-[#1b3641]"
          aria-label={tr(language, "Edit total monthly cap", "Chỉnh sửa tổng hạn mức tháng")}
        >
          <span className="material-symbols-outlined text-[16px]">edit</span>
          <span className="text-xs font-semibold">{tr(language, "Edit", "Sửa")}</span>
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
              onClick={saveCap}
              disabled={loading}
              className="rounded-xl bg-[#006f1d] px-4 py-2 text-xs font-bold text-[#eaffe2] disabled:opacity-70"
            >
              {loading ? tr(language, "Saving", "Đang lưu") : tr(language, "Save", "Lưu")}
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
              {tr(language, "Cancel", "Hủy")}
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
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{tr(language, "Allocated", "Đã phân bổ")}</p>
          <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">
            {formatCurrency(allocated, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{tr(language, "Remaining", "Còn lại")}</p>
          <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#2e7d32]">
            {formatCurrency(remaining, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8aa2b0]">{tr(language, "This Month Income", "Thu nhập tháng này")}</p>
          <p className="mt-1 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">
            {formatCurrency(monthIncome, currency)}
          </p>
        </div>
      </div>
    </article>
  );
}
