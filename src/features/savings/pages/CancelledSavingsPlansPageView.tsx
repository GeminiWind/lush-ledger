"use client";

import Link from "next/link";
import { localeDateLabel } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import SavingsFilterDropdown from "@/features/savings/components/SavingsFilterDropdown";

const toNumber = (value: unknown) => Number(value ?? 0);

type Props = {
  language: string;
  currency: string;
  plans: Array<{
    id: string;
    name: string;
    icon: string | null;
    targetAmount: unknown;
    createdAt: Date;
    transactions: Array<{
      id: string;
      amount: unknown;
      type: string;
      date: Date;
      notes: string | null;
    }>;
  }>;
};

const getPlanIcon = (name: string) => {
  const normalized = name.toLowerCase();

  if (/(green|eco|future)/.test(normalized)) {
    return "eco";
  }
  if (/(travel|trip|tour|vacation|flight)/.test(normalized)) {
    return "flight_takeoff";
  }
  if (/(laptop|setup|work|pro)/.test(normalized)) {
    return "laptop_mac";
  }
  if (/(home|house|atelier|studio|property)/.test(normalized)) {
    return "home_work";
  }

  return "savings";
};

export default function CancelledSavingsPlansPageView({ language, currency, plans }: Props) {
  const locale = language === "vi-VN" ? "vi-VN" : "en-US";
  const t = useNamespacedTranslation("savings", language);
  const activeFilter = "cancelled";

  const list = plans.map((plan) => {
    const target = toNumber(plan.targetAmount);
    const saved = Math.max(
      0,
      plan.transactions.reduce((sum, tx) => {
        const amount = toNumber(tx.amount);
        return sum + (tx.type === "expense" || tx.type === "refund" ? -amount : amount);
      }, 0),
    );
    const completion = target > 0 ? Math.max(0, Math.min((saved / target) * 100, 100)) : 0;

    const cancellationTx =
      plan.transactions.find((tx) => tx.type === "refund" && tx.notes?.includes("cancelled savings plan")) ||
      plan.transactions.find((tx) => tx.type === "refund") ||
      null;

    return {
      id: plan.id,
      name: plan.name,
      icon: plan.icon || getPlanIcon(plan.name),
      closedAt: cancellationTx?.date || plan.transactions[0]?.date || plan.createdAt,
      reason: cancellationTx?.notes?.trim() || t("savingsCancelledReasonFallback"),
      saved,
      target,
      completion,
    };
  }).sort((left, right) => right.closedAt.getTime() - left.closedAt.getTime());

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-medium text-[#49636f]">{t("savingsPortfolio")}</p>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-[-0.03em] text-[#1b3641] lg:text-6xl">
            {t("savingsTitle").split(" ")[0]} <span className="italic text-[#006f1d]">{t("savingsTitle").split(" ").slice(1).join(" ")}</span>
          </h1>
          <SavingsFilterDropdown currentFilter={activeFilter} />
        </div>
        <p className="max-w-3xl text-base text-[#49636f]">{t("savingsCancelledListSubtitle")}</p>
      </header>

      {list.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#c7dce9] bg-white px-4 py-10 text-center text-sm text-[#647e8c]">{t("savingsCancelledListEmpty")}</p>
      ) : (
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {list.map((plan) => (
            <Link
              key={plan.id}
              href={`/app/savings/cancelled/${plan.id}`}
              className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className="material-symbols-outlined pointer-events-none absolute -bottom-4 -right-4 text-7xl text-[#1b3641]/5 transition-transform duration-500 group-hover:rotate-6">{plan.icon}</span>

              <div className="relative z-10 flex h-full flex-col gap-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e7f6ff] text-[#006f1d]">
                      <span className="material-symbols-outlined text-2xl">{plan.icon}</span>
                    </div>
                    <div>
                      <h2 className="font-[var(--font-manrope)] text-lg font-bold leading-tight tracking-tight text-[#1b3641]">{plan.name}</h2>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#647e8c]">
                        {t("savingsCancelledCardCancelledAt")} {localeDateLabel(plan.closedAt, locale, { month: "short", day: "2-digit", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-[#f8cfc4] bg-[#fff3ef] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#a73b21]">
                    {t("savingsCancelledStatusLabel")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#647e8c]">{t("savingsCancelledCardFinalValue")}</p>
                    <p className="mt-1 font-[var(--font-manrope)] text-xl font-black text-[#1b3641]">{formatCurrency(plan.saved, currency)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#647e8c]">{t("savingsCancelledCardOriginalGoal")}</p>
                    <p className="mt-1 font-[var(--font-manrope)] text-xl font-black text-[#1b3641]/45">{formatCurrency(plan.target, currency)}</p>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-bold">
                    <span className="text-[#647e8c]">{t("savingsCancelledCompletion")}</span>
                    <span className="text-[#1b3641]">{Math.round(plan.completion)}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-[#d4ecf9]">
                    <div className="h-full rounded-full bg-[#006f1d]" style={{ width: `${Math.round(plan.completion)}%` }} />
                  </div>
                </div>

                <div className="border-t border-[#9bb6c4]/20 pt-5">
                  <p className="text-sm italic leading-relaxed text-[#49636f]">
                    <span className="font-bold not-italic">{t("savingsCancelledCardReasonPrefix")}:</span> {plan.reason}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
