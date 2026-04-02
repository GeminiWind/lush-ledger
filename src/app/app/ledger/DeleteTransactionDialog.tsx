"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { fromISODate, localeDateLabel, nowDate } from "@/lib/date";
import { getDictionary } from "@/lib/i18n";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type DeleteTransactionDialogProps = {
  language: string;
  currency: string;
  transaction: {
    id: string;
    type: string;
    amount: number;
    notes: string | null;
    date: string;
    accountName: string;
    categoryName: string | null;
    icon: string;
  };
};

const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

export default function DeleteTransactionDialog({
  language,
  currency,
  transaction,
}: DeleteTransactionDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = getDictionary(language);
  const locale = language === "vi-VN" ? "vi-VN" : "en-US";
  const queryClient = useQueryClient();

  const deleteTransactionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/ledger/${transaction.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.ledgerDeleteFailed);
      }
    },
    onSuccess: async () => {
      toast.success(t.ledgerDeleteSuccess);
      close();
      await queryClient.invalidateQueries({ queryKey: ["ledger"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t.ledgerDeleteFailed);
    },
  });

  const subject = useMemo(() => {
    return transaction.notes?.trim() || transaction.categoryName || transaction.accountName;
  }, [transaction.accountName, transaction.categoryName, transaction.notes]);

  const category = transaction.categoryName || t.ledgerUncategorized;
  const parsedDate = fromISODate(transaction.date) || nowDate();
  const formattedDateLabel = localeDateLabel(parsedDate, locale, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setError(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    setError(null);
  };

  const onDelete = async () => {
    setError(null);
    deleteTransactionMutation.mutate();
  };

  return (
    <>
      <button
        type="button"
        aria-label={t.ledgerDeleteAria}
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-emerald-950/20 p-4 backdrop-blur-sm"
          onMouseDown={close}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-[0_32px_64px_-16px_rgba(27,54,65,0.12)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="p-8 pb-4">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>

              <h2 className="mb-3 font-[var(--font-manrope)] text-2xl font-extrabold tracking-tight text-[#1b3641]">
                {t.ledgerDeleteTitle}
              </h2>
              <p className="mb-6 text-sm font-medium leading-relaxed text-[#49636f]">
                {t.ledgerDeleteBody}
              </p>

              <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-emerald-800 shadow-sm">
                    <span className="material-symbols-outlined text-xl">{transaction.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1b3641]">{subject}</p>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#49636f]">{category}</p>
                    <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-[#49636f]/70">
                      {formattedDateLabel}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-extrabold text-[#1b3641]">
                  {transaction.type === "income" || transaction.type === "refund" ? "+" : "-"}
                  {asCurrency(Math.abs(transaction.amount), currency)}
                </p>
              </div>

              {error ? (
                <p className="mb-3 rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-2 text-xs text-[#a73b21]">{error}</p>
              ) : null}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleteTransactionMutation.isPending}
                  className="w-full rounded-2xl bg-[#fcedea] py-4 text-sm font-bold tracking-tight text-[#7d2212] transition-colors hover:bg-[#f9dad4] disabled:opacity-70"
                >
                  {deleteTransactionMutation.isPending
                    ? t.ledgerDeleteDeleting
                    : t.ledgerDeleteAction}
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="w-full rounded-2xl border border-transparent bg-white py-4 text-sm font-bold tracking-tight text-[#49636f] transition-colors hover:bg-slate-50"
                >
                  {t.ledgerDeleteKeep}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/50 px-8 py-6">
              <span className="material-symbols-outlined text-xs text-slate-400">info</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t.ledgerDeletePermanent}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
