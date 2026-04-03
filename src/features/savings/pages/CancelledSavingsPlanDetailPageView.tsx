"use client";

import Link from "next/link";
import { daysUntil, localeDateLabel, localeTimeLabel } from "@/lib/date";
import { formatCurrency } from "@/lib/format";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";

const toNumber = (value: unknown) => Number(value ?? 0);

type Plan = {
  id: string;
  name: string;
  status: string;
  targetAmount: unknown;
  createdAt: Date;
  transactions: Array<{
    id: string;
    amount: unknown;
    type: string;
    date: Date;
    notes: string | null;
    account: { name: string } | null;
  }>;
};

type Props = {
  language: string;
  currency: string;
  plan: Plan;
};

type HistoryEvent = {
  id: string;
  title: string;
  subtitle: string;
  date: Date;
  icon: string;
  amount?: number;
  amountTone?: "positive" | "neutral";
};

export default function CancelledSavingsPlanDetailPageView({ language, currency, plan }: Props) {
  const locale = language === "vi-VN" ? "vi-VN" : "en-US";
  const t = useNamespacedTranslation("savings", language);

  const targetAmount = toNumber(plan.targetAmount);
  const finalSaved = Math.max(
    0,
    plan.transactions.reduce((sum, tx) => {
      const amount = toNumber(tx.amount);
      return sum + (tx.type === "expense" || tx.type === "refund" ? -amount : amount);
    }, 0),
  );
  const completion = targetAmount > 0 ? Math.max(0, Math.min((finalSaved / targetAmount) * 100, 100)) : 0;

  const cancellationTx =
    plan.transactions.find((tx) => tx.type === "refund" && tx.notes?.includes("cancelled savings plan")) ||
    plan.transactions.find((tx) => tx.type === "refund") ||
    null;

  const closedAt = cancellationTx?.date || plan.transactions[0]?.date || plan.createdAt;
  const durationDays = Math.max(1, daysUntil(closedAt, plan.createdAt));
  const destinationWallet = cancellationTx?.account?.name || t("walletDefaultBadge");

  const history: HistoryEvent[] = [];

  if (cancellationTx) {
    history.push({
      id: `cancel-${cancellationTx.id}`,
      title: t("savingsCancelledHistoryCancellation"),
      subtitle: t("savingsCancelledHistoryCancellationBody"),
      date: cancellationTx.date,
      icon: "event_busy",
      amountTone: "neutral",
    });
  }

  for (const tx of plan.transactions) {
    if (tx.type !== "transfer_to_saving_plan") {
      continue;
    }
    history.push({
      id: `contribution-${tx.id}`,
      title: t("savingsCancelledHistoryContribution"),
      subtitle: tx.notes?.trim() || t("savingsCancelledHistoryContributionBody"),
      date: tx.date,
      icon: "add_circle",
      amount: toNumber(tx.amount),
      amountTone: "positive",
    });
    if (history.length >= 4) {
      break;
    }
  }

  history.push({
    id: `inception-${plan.id}`,
    title: t("savingsCancelledHistoryInception"),
    subtitle: `${t("savingsCancelledHistoryInceptionBody")}: ${plan.name}`,
    date: plan.createdAt,
    icon: "flag",
    amountTone: "neutral",
  });

  history.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-8">
      <div>
        <Link href="/app/savings/cancelled" className="inline-flex items-center gap-2 text-sm font-medium text-[#49636f] hover:text-[#006f1d]">
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          {t("savingsCancelledBackToArchive")}
        </Link>
      </div>

      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f8cfc4] bg-[#fd795a]/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#6e1400]">
            <span className="material-symbols-outlined text-sm">cancel</span>
            {t("savingsCancelledStatusLabel")}
          </span>
          <h1 className="mt-4 font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641] md:text-5xl">{plan.name}</h1>
          <p className="mt-2 text-sm text-[#49636f]">
            {t("savingsCancelledClosedOn")} <span className="font-bold">{localeDateLabel(closedAt, locale, { month: "short", day: "2-digit", year: "numeric" })}</span>
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <article className="rounded-3xl bg-white p-8 shadow-sm md:col-span-7">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t("savingsCancelledFinalProgress")}</h2>
          <div className="mt-6 flex items-end justify-between gap-6">
            <div>
              <p className="font-[var(--font-manrope)] text-3xl font-extrabold text-[#1b3641]">{formatCurrency(finalSaved, currency)}</p>
              <p className="mt-1 text-sm text-[#647e8c]">{t("savingsCancelledFinalSaved")}</p>
            </div>
            <div className="text-right">
              <p className="font-[var(--font-manrope)] text-2xl font-bold text-[#647e8c]">{formatCurrency(targetAmount, currency)}</p>
              <p className="mt-1 text-sm text-[#647e8c]">{t("savingsCancelledTargetObjective")}</p>
            </div>
          </div>

          <div className="mt-8 h-3 overflow-hidden rounded-full bg-[#d4ecf9]">
            <div className="h-full rounded-full bg-[#647e8c]" style={{ width: `${Math.round(completion)}%` }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="font-bold text-[#49636f]">{Math.round(completion)}% {t("savingsCancelledCompletion")}</span>
            <span className="inline-flex items-center gap-1 text-xs text-[#647e8c]">
              <span className="material-symbols-outlined text-sm">history</span>
              {t("savingsCancelledArchiveLock")}
            </span>
          </div>
        </article>

        <article className="rounded-3xl bg-[#e7f6ff] p-8 md:col-span-5">
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t("savingsCancelledImpactAnalysis")}</h2>
          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d4ecf9] text-[#006f1d]">
                <span className="material-symbols-outlined">calendar_today</span>
              </div>
              <div>
                <p className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{durationDays} days</p>
                <p className="text-xs text-[#647e8c]">{t("savingsCancelledDurationActive")}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#d4ecf9] text-[#006f1d]">
                <span className="material-symbols-outlined">account_balance_wallet</span>
              </div>
              <div>
                <p className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{destinationWallet}</p>
                <p className="text-xs text-[#647e8c]">{t("savingsCancelledLiquidityDestination")}</p>
              </div>
            </div>
          </div>
        </article>

        <article className="relative overflow-hidden rounded-3xl bg-[#e7f6ff] p-8 md:col-span-8">
          <span className="material-symbols-outlined pointer-events-none absolute -right-4 -top-4 text-8xl text-[#9bb6c4]/30">format_quote</span>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t("savingsCancelledReasonTitle")}</h2>
          <p className="relative z-10 mt-4 font-[var(--font-manrope)] text-2xl font-medium leading-snug text-[#1b3641]">
            {cancellationTx?.notes?.trim() || t("savingsCancelledReasonFallback")}
          </p>
        </article>

        <article className="overflow-hidden rounded-3xl md:col-span-4">
          <img
            alt="Archived saving plan visual"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlHNCWKoO7d3ynu17zmIDpHqxEturMVSU666Af9vFZPVbgU_zOcvPj8B7YQHZ9IUl5VQYqH0tu5s-viyodE8Isi3f4crh7b7ZiWPsyvEICnqvKn9n0jj9ImqwiWZp98tfu5U7M26bJPTE9NIhU_thcdGGdFNYA6QX1--enJhGwgXSC_m8A8wepUNajvAjgP_Jf1r6vVrzBbww258NP1hqZnN5DFVIDGp4OEugNdisl93Vza16hu61XjGoEJwKm3GjLDCrsv1gqRFQ"
            className="h-full min-h-[220px] w-full object-cover grayscale opacity-85 transition duration-700 hover:grayscale-0 hover:opacity-100"
          />
        </article>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-[var(--font-manrope)] text-2xl font-extrabold text-[#1b3641]">{t("savingsCancelledHistoryTitle")}</h2>
          <Link href={`/app/ledger?query=${encodeURIComponent(plan.name)}`} className="inline-flex items-center gap-1 text-sm font-bold text-[#006f1d] hover:underline">
            {t("savingsCancelledHistoryOpenLedger")}
            <span className="material-symbols-outlined text-sm">open_in_new</span>
          </Link>
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#c7dce9] bg-white px-4 py-8 text-center text-sm text-[#647e8c]">{t("savingsCancelledNoHistory")}</p>
          ) : (
            history.map((event) => (
              <article key={event.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm transition hover:bg-[#f7fcff]">
                <div className="flex items-center gap-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-full ${event.amountTone === "positive" ? "bg-[#eaffe2] text-[#006f1d]" : "bg-[#fff3ef] text-[#a73b21]"}`}>
                    <span className="material-symbols-outlined">{event.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#1b3641]">{event.title}</p>
                    <p className="text-sm text-[#647e8c]">{event.subtitle}</p>
                  </div>
                </div>

                <div className="text-right">
                  {typeof event.amount === "number" ? (
                    <p className="font-[var(--font-manrope)] text-lg font-bold text-[#006f1d]">+{formatCurrency(Math.abs(event.amount), currency)}</p>
                  ) : (
                    <p className="font-[var(--font-manrope)] text-lg font-bold text-[#1b3641]">{localeDateLabel(event.date, locale, { month: "short", day: "2-digit", year: "numeric" })}</p>
                  )}
                  <p className="text-xs text-[#647e8c]">{localeTimeLabel(event.date, locale, { hour: "2-digit", minute: "2-digit" })} GMT+7</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
