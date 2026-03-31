"use client";

import { getDictionary } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCurrencyInput, getCurrencyInputSuggestions, parseCurrencyInput } from "@/lib/format";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Option = {
  id: string;
  name: string;
};

type Props = {
  transactionId: string;
  language: string;
  currency: string;
  categories: Option[];
  initialAmount: number;
  initialCategoryId: string;
  initialDate: string;
  initialDescription: string;
  initialNote: string;
};

type Values = {
  amountDisplay: string;
  categoryId: string;
  date: string;
  description: string;
  note: string;
};

export default function EditTransactionForm({
  transactionId,
  language,
  currency,
  categories,
  initialAmount,
  initialCategoryId,
  initialDate,
  initialDescription,
  initialNote,
}: Props) {
  const router = useRouter();
  const t = getDictionary(language);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const closeDialog = useCallback(() => {
    router.push("/app/ledger");
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDialog();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDialog]);

  const initialAmountDisplay = formatCurrencyInput(String(initialAmount), currency);

  const updateTransactionMutation = useMutation({
    mutationFn: async (values: Values) => {
      const notes = [values.description.trim(), values.note.trim()].filter(Boolean).join(" - ");
      const response = await fetch(`/api/ledger/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseCurrencyInput(values.amountDisplay),
          categoryId: values.categoryId,
          date: values.date,
          notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.txUpdateFailed);
      }
    },
    onSuccess: async () => {
      toast.success(t.txUpdateSuccess);
      await queryClient.invalidateQueries({ queryKey: ["ledger"] });
      router.push("/app/ledger");
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t.txUpdateFailed);
    },
  });

  const formik = useFormik<Values>({
    initialValues: {
      amountDisplay: initialAmountDisplay,
      categoryId: initialCategoryId,
      date: initialDate,
      description: initialDescription,
      note: initialNote,
    },
    validate: (values) => {
      const errors: Partial<Record<keyof Values, string>> = {};
      if (parseCurrencyInput(values.amountDisplay) <= 0) {
        errors.amountDisplay = t.txErrorAmountRequired;
      }
      if (!values.date) {
        errors.date = t.txErrorDateRequired;
      }
      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      updateTransactionMutation.mutate(values);
    },
  });

  const onAmountChange = (rawValue: string) => {
    formik.setFieldValue("amountDisplay", formatCurrencyInput(rawValue, currency));
  };

  const amountSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.amountDisplay, currency);
  }, [currency, formik.values.amountDisplay]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/30 p-4 backdrop-blur-sm"
      onMouseDown={closeDialog}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-8 pb-4 pt-8">
          <h1 className="font-[var(--font-manrope)] text-2xl font-extrabold tracking-tight text-emerald-900">{t.txEditTitle}</h1>
            <button
              type="button"
              onClick={closeDialog}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100"
              aria-label={t.txEditCloseAria}
            >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5 px-8 pb-8">
          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6f8793]">{t.txEditAmountLabel}</label>
            <div className="relative">
              <input
                name="amountDisplay"
                value={formik.values.amountDisplay}
                onChange={(event) => onAmountChange(event.target.value)}
                onBlur={() => formik.setFieldTouched("amountDisplay", true)}
                inputMode="numeric"
                className="w-full rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 px-5 py-3.5 text-xl font-extrabold text-emerald-900 transition-all focus:border-emerald-600 focus:ring-0"
              />
              <span className="material-symbols-outlined pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-emerald-600/50">
                payments
              </span>
            </div>
            {amountSuggestions.length ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {amountSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.value}
                    type="button"
                    onClick={() => formik.setFieldValue("amountDisplay", formatCurrencyInput(String(suggestion.value), currency))}
                    className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100"
                  >
                    {suggestion.label}
                  </button>
                ))}
              </div>
            ) : null}
            {formik.touched.amountDisplay && formik.errors.amountDisplay ? (
              <p className="text-xs text-[#a73b21]">{formik.errors.amountDisplay}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6f8793]">{t.txCategory}</label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  className="w-full appearance-none rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 px-5 py-3 text-sm font-semibold text-[#1b3641] transition-all focus:border-emerald-600 focus:ring-0"
                >
                  <option value="">{t.txNoCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                  expand_more
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6f8793]">{t.txDate}</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 px-5 py-3 text-sm font-semibold text-[#1b3641] transition-all focus:border-emerald-600 focus:ring-0"
                />
              </div>
              {formik.touched.date && formik.errors.date ? <p className="text-xs text-[#a73b21]">{formik.errors.date}</p> : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6f8793]">{t.txDescription}</label>
            <input
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder={t.txDescriptionPlaceholder}
              className="w-full rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 px-5 py-3 text-sm font-semibold text-[#1b3641] transition-all focus:border-emerald-600 focus:ring-0"
            />
            {formik.touched.description && formik.errors.description ? (
              <p className="text-xs text-[#a73b21]">{formik.errors.description}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label className="ml-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#6f8793]">{t.txNotes}</label>
            <textarea
              name="note"
              value={formik.values.note}
              onChange={formik.handleChange}
              rows={4}
              placeholder={t.txNotesPlaceholder}
              className="min-h-[100px] w-full resize-none rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 px-5 py-3 text-sm font-medium text-[#1b3641] transition-all focus:border-emerald-600 focus:ring-0"
            />
          </div>

          {error ? <p className="rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-3 text-sm text-[#a73b21]">{error}</p> : null}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={closeDialog}
              className="flex-1 rounded-2xl bg-slate-100 py-3.5 text-sm font-bold text-slate-500 transition-all hover:bg-slate-200"
            >
              {t.txEditCancel}
            </button>
            <button
              type="submit"
              disabled={updateTransactionMutation.isPending}
              className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#2e7d32] py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              {updateTransactionMutation.isPending ? t.txEditSaving : t.txEditSave}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
