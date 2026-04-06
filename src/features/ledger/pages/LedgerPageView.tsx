"use client";

import { useState } from "react";
import { addDaysDate, localeDateLabel, localeTimeLabel, nowDate, sameDay, toISODate } from "@/lib/date";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import type { getLedgerData } from "@/lib/ledger";
import Link from "next/link";
import toast from "react-hot-toast";
import DeleteTransactionDialog from "@/features/ledger/dialogs/DeleteTransactionDialog";
import { exportTransactionsCsv } from "@/features/ledger/services";

type Translator = ((key: string) => string) & Record<string, string>;

type SearchParams = {
  query?: string;
  type?: string;
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
};

type Props = {
  language: string;
  currency: string;
  params: SearchParams;
  data: Awaited<ReturnType<typeof getLedgerData>>;
};

const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

const asDayLabel = (value: Date, language: string, t: Translator) => {
  const today = nowDate();
  const yesterday = addDaysDate(today, -1);

  if (sameDay(value, today)) {
    return t("ledgerToday");
  }
  if (sameDay(value, yesterday)) {
    return t("ledgerYesterday");
  }

  return localeDateLabel(value, language === "vi-VN" ? "vi-VN" : "en-US", {
    month: "long",
    day: "2-digit",
  });
};

const asTime = (value: Date, language: string) => {
  return localeTimeLabel(value, language === "vi-VN" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const txVisual = (type: string, name: string, categoryIcon?: string | null) => {
  if (type === "income") {
    return {
      icon: "trending_up",
      badge: "bg-[#0f7a2f] text-white",
      amountClass: "text-[#0f7a2f]",
    };
  }

  if (type === "transfer_to_saving_plan") {
    return {
      icon: "savings",
      badge: "bg-[#eaffe2] text-[#006f1d]",
      amountClass: "text-[#1b3641]",
    };
  }

  if (type === "refund") {
    return {
      icon: "reply",
      badge: "bg-[#eaffe2] text-[#006f1d]",
      amountClass: "text-[#0f7a2f]",
    };
  }

  const label = name.toLowerCase();
  if (label.includes("coffee") || label.includes("dining") || label.includes("food")) {
    const matched = {
      icon: "coffee",
      badge: "bg-emerald-100 text-emerald-800",
      amountClass: "text-[#1b3641]",
    };
    return { ...matched, icon: categoryIcon?.trim() || matched.icon };
  }

  if (label.includes("rent") || label.includes("home") || label.includes("utility")) {
    const matched = {
      icon: "apartment",
      badge: "bg-orange-100 text-orange-700",
      amountClass: "text-[#1b3641]",
    };
    return { ...matched, icon: categoryIcon?.trim() || matched.icon };
  }

  if (label.includes("travel") || label.includes("flight")) {
    const matched = {
      icon: "flight",
      badge: "bg-violet-100 text-violet-800",
      amountClass: "text-[#1b3641]",
    };
    return { ...matched, icon: categoryIcon?.trim() || matched.icon };
  }

  const fallback = {
    icon: "inventory_2",
    badge: "bg-sky-100 text-sky-800",
    amountClass: "text-[#1b3641]",
  };
  return { ...fallback, icon: categoryIcon?.trim() || fallback.icon };
};

export default function LedgerPageView({ language, currency, params, data }: Props) {
  const t = useNamespacedTranslation("ledger", language);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const result = await exportTransactionsCsv({
        query: params.query,
        type: params.type as "income" | "expense" | "transfer_to_saving_plan" | "refund" | undefined,
        accountId: params.accountId,
        categoryId: params.categoryId,
        startDate: params.startDate,
        endDate: params.endDate,
      });

      const fileUrl = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = fileUrl;
      anchor.download = result.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(fileUrl);

      toast.success(t("ledgerExportSuccess"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("ledgerExportFailed");
      setExportError(message);
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  type LedgerTransaction = (typeof data.transactions)[number];
  const groupedTransactions = data.transactions.reduce(
    (groups: Array<{ key: string; label: string; items: LedgerTransaction[] }>, transaction) => {
      const key = toISODate(transaction.date);
      const currentGroup = groups[groups.length - 1];

      if (currentGroup && currentGroup.key === key) {
        currentGroup.items.push(transaction);
        return groups;
      }

      groups.push({
        key,
        label: asDayLabel(transaction.date, language, t),
        items: [transaction],
      });
      return groups;
    },
    [],
  );

  const renderedCount = groupedTransactions.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <div className="space-y-10">
      <section className="flex items-center gap-8 border-b border-[#dce9e2] pb-2">
          <Link href="/app/ledger" className="border-b-2 border-[#006f1d] pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#1b3641]">
          {t("ledgerTabActivity")}
        </Link>
        <Link href="/app/ledger/reports" className="pb-2 font-[var(--font-manrope)] text-lg font-semibold text-[#006f1d]/60 hover:text-[#1b3641]">
          {t("ledgerTabReports")}
        </Link>
      </section>

      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-[var(--font-manrope)] text-5xl font-extrabold tracking-[-0.03em] text-[#1b3641]">
            {t("ledgerTitle")}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-[#49636f]">
            {t("ledgerSubtitle")}
          </p>
        </div>

        <div className="grid w-full gap-4 sm:w-auto sm:grid-cols-1">
          <article className="rounded-2xl border border-slate-100 bg-white px-8 py-5 text-center shadow-[0_6px_24px_-18px_rgba(27,54,65,0.4)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7b939f]">{t("ledgerMtdSpending")}</p>
            <p className="mt-1 font-[var(--font-manrope)] text-2xl font-extrabold tracking-tight text-[#1b3641]">
              {asCurrency(data.summary.monthExpense, currency)}
            </p>
          </article>
        </div>
      </section>

      <section className="space-y-5">
        <form className="flex flex-wrap items-center gap-3" method="get" role="search">
          <label className="sr-only" htmlFor="query">
            {t("ledgerSearchEntries")}
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-slate-400">search</span>
            <input
              id="query"
              name="query"
              defaultValue={params.query || ""}
              placeholder={t("ledgerSearchPlaceholder")}
              className="w-40 border-none bg-transparent p-0 text-sm text-[#1b3641] placeholder:text-[#8aa2b0] focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-slate-400">filter_list</span>
            <select
              name="categoryId"
              defaultValue={params.categoryId || ""}
              className="border-none bg-transparent p-0 text-sm font-semibold text-[#1b3641] focus:ring-0"
            >
              <option value="">{t("ledgerFilterCategory")}</option>
              {data.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-slate-400">payments</span>
            <select
              name="type"
              defaultValue={params.type || ""}
              className="border-none bg-transparent p-0 text-sm font-semibold text-[#1b3641] focus:ring-0"
            >
              <option value="">{t("ledgerFilterAmount")}</option>
              <option value="income">{t("ledgerTypeIncome")}</option>
              <option value="expense">{t("ledgerTypeExpense")}</option>
              <option value="transfer_to_saving_plan">{t("ledgerTypeTransferToSaving")}</option>
              <option value="refund">Refund</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-slate-400">account_balance_wallet</span>
            <select
              name="accountId"
              defaultValue={params.accountId || ""}
              className="border-none bg-transparent p-0 text-sm font-semibold text-[#1b3641] focus:ring-0"
            >
              <option value="">{t("ledgerFilterWallet")}</option>
              {data.accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2 shadow-sm">
            <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
            <label className="sr-only" htmlFor="startDate">
              {t("ledgerFilterDateFrom")}
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={params.startDate || ""}
              className="border-none bg-transparent p-0 text-sm font-semibold text-[#1b3641] focus:ring-0"
            />
            <span className="text-xs font-semibold text-[#6f8793]">{t("ledgerFilterDateTo")}</span>
            <label className="sr-only" htmlFor="endDate">
              {t("ledgerFilterDateTo")}
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={params.endDate || ""}
              className="border-none bg-transparent p-0 text-sm font-semibold text-[#1b3641] focus:ring-0"
            />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button type="button" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#006f1d]">
              <span className="material-symbols-outlined">view_list</span>
            </button>
            <button type="button" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#006f1d]">
              <span className="material-symbols-outlined">grid_view</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 rounded-xl border border-transparent px-4 py-2 text-sm font-bold text-[#006f1d] transition-all hover:border-emerald-100 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              {isExporting ? t("ledgerExporting") : t("ledgerExport")}
            </button>
            <button
              type="submit"
              className="rounded-xl bg-[#006f1d] px-4 py-2 text-sm font-bold text-[#eaffe2] shadow-[0_10px_20px_-12px_rgba(0,111,29,0.6)] hover:brightness-105"
            >
              {t("ledgerApply")}
            </button>
          </div>
        </form>

        {exportError ? (
          <div className="flex items-center justify-between gap-4 rounded-xl border border-[#fd795a]/40 bg-[#fff7f6] px-4 py-3 text-sm text-[#6e1400]">
            <p>{exportError}</p>
            <button
              type="button"
              onClick={handleExport}
              disabled={isExporting}
              className="rounded-lg bg-[#6e1400] px-3 py-1.5 text-xs font-bold text-[#fff7f6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("ledgerExportRetry")}
            </button>
          </div>
        ) : null}

        <section className="space-y-8">
          {groupedTransactions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#d7e5dc] bg-white px-4 py-8 text-center text-sm text-[#647e8c]">
              {t("ledgerNoEntriesMatch")}
            </p>
          ) : (
            groupedTransactions.map((group) => (
              <div key={group.key} className="space-y-3">
                <h2 className="flex items-center gap-4 px-2 text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                  <span>{group.label}</span>
                  <span className="h-px flex-1 bg-[#c8dbe7]/50" />
                </h2>

                <div className="space-y-2">
                  {group.items.map((tx) => {
                    const subject = tx.notes?.trim() || tx.category?.name || tx.account.name;
                    const detailLabel =
                      tx.type === "transfer_to_saving_plan"
                        ? `${t("ledgerTransferToSaving")} • ${tx.savingsPlan?.name || t("ledgerUncategorized")}`
                        : tx.type === "refund"
                          ? `Refund • ${tx.savingsPlan?.name || t("ledgerUncategorized")}`
                        : tx.category?.name || t("ledgerUncategorized");
                    const detail = `${detailLabel} • ${asTime(tx.date, language)}`;
                    const visual = txVisual(tx.type, subject, tx.category?.icon);

                    return (
                      <article
                        key={tx.id}
                        className="group flex items-center justify-between rounded-2xl border border-transparent bg-white p-4 transition hover:border-emerald-100 hover:bg-emerald-50/40"
                      >
                        <div className="flex min-w-0 items-center gap-5">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${visual.badge}`}>
                            <span className="material-symbols-outlined">{visual.icon}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-[#1b3641] transition group-hover:text-[#006f1d]">
                              {subject}
                            </p>
                            <p className="truncate text-xs font-medium text-[#6f8793]">{detail}</p>
                          </div>
                        </div>

                        <div className="ml-4 flex items-center gap-4">
                          <div className="text-right">
                            <p className={`font-[var(--font-manrope)] text-lg font-extrabold ${visual.amountClass}`}>
                              {tx.type === "income" || tx.type === "refund" ? "+" : "-"}
                              {asCurrency(Number(tx.amount), currency)}
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#7f97a4]">
                              {tx.account.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                            <Link
                              href={`/app/ledger/${tx.id}/edit`}
                              aria-label="Edit transaction"
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-[#006f1d]"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </Link>
                            <DeleteTransactionDialog
                              language={language}
                              currency={currency}
                              transaction={{
                                id: tx.id,
                                type: tx.type,
                                amount: Number(tx.amount),
                                notes: tx.notes,
                                date: toISODate(tx.date),
                                accountName: tx.account.name,
                                categoryName: tx.category?.name || null,
                                icon: visual.icon,
                              }}
                            />
                          </div>
                          <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </section>
      </section>

      <footer className="flex items-center justify-between border-t border-slate-200/60 pt-8">
        <p className="text-sm font-medium text-[#6f8793]">{t("ledgerShowingTransactions")}: {renderedCount}</p>
        <div className="flex items-center gap-2">
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#006f1d] text-sm font-bold text-[#eaffe2]">
            1
          </button>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
