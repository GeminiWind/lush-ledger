"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useFormik } from "formik";
import { nowDate, toISODate } from "@/lib/date";
import { formatCurrencyInput, getCurrencyInputSuggestions, parseCurrencyInput } from "@/lib/format";
import type { LedgerEntryFormProps, LedgerEntryMutationValues } from "@/features/ledger/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const today = toISODate(nowDate());

const buildDateTimeWithCurrentTime = (dateValue: string) => {
  const selectedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    return dateValue;
  }

  const now = nowDate();
  selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return selectedDate.toISOString();
};

export default function LedgerEntryForm({ accounts, categories, currency = "VND" }: LedgerEntryFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createLedgerEntryMutation = useMutation({
    mutationFn: async (values: LedgerEntryMutationValues) => {
      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          amount: parseCurrencyInput(values.amount),
          date: buildDateTimeWithCurrentTime(values.date),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Could not create transaction.");
      }
    },
    onSuccess: async () => {
      formik.resetForm({ values: { ...formik.initialValues, date: today, type: "expense" } });
      await queryClient.invalidateQueries({ queryKey: ["ledger"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : "Could not create transaction.");
    },
  });

  const formik = useFormik({
    initialValues: {
      accountId: "",
      categoryId: "",
      type: "expense",
      amount: "",
      date: today,
      notes: "",
    },
    validate: (values) => {
      const errors: { accountId?: string; amount?: string; date?: string } = {};
      if (!values.accountId) {
        errors.accountId = "Wallet is required.";
      }
       if (parseCurrencyInput(values.amount) <= 0) {
         errors.amount = "Amount is required.";
       }
      if (!values.date) {
        errors.date = "Date is required.";
      }
      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      createLedgerEntryMutation.mutate(values);
    },
  });

  const amountSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.amount, currency);
  }, [currency, formik.values.amount]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-6">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">
            Wallet <span className="text-[#a73b21]">*</span>
          </label>
          <select
            name="accountId"
            value={formik.values.accountId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full rounded-xl border border-[#d7e5dc] bg-white px-3 py-2 text-sm text-[#1b3641]"
          >
            <option value="">Wallet</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {formik.touched.accountId && formik.errors.accountId ? <p className="text-xs text-[#a73b21]">{formik.errors.accountId}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">Category</label>
          <select
            name="categoryId"
            value={formik.values.categoryId}
            onChange={formik.handleChange}
            className="w-full rounded-xl border border-[#d7e5dc] bg-white px-3 py-2 text-sm text-[#1b3641]"
          >
            <option value="">Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">Type</label>
          <select
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            className="w-full rounded-xl border border-[#d7e5dc] bg-white px-3 py-2 text-sm text-[#1b3641]"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">
            Amount <span className="text-[#a73b21]">*</span>
          </label>
          <input
            name="amount"
            type="text"
            value={formik.values.amount}
            onChange={(event) => {
              formik.setFieldValue("amount", formatCurrencyInput(event.target.value, currency));
            }}
            onBlur={formik.handleBlur}
            inputMode="numeric"
            placeholder="Amount"
            className="w-full rounded-xl border border-[#d7e5dc] bg-white px-3 py-2 text-sm text-[#1b3641]"
          />
          {amountSuggestions.length ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {amountSuggestions.map((suggestion) => (
                <button
                  key={suggestion.value}
                  type="button"
                  onClick={() => formik.setFieldValue("amount", formatCurrencyInput(String(suggestion.value), currency))}
                  className="rounded-full border border-[#d7e5dc] bg-[#f7fcff] px-2.5 py-1 text-[10px] font-bold text-[#1b3641] transition hover:border-[#9bb6c4] hover:bg-[#eef7ff]"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          ) : null}
          {formik.touched.amount && formik.errors.amount ? <p className="text-xs text-[#a73b21]">{formik.errors.amount}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">
            Date <span className="text-[#a73b21]">*</span>
          </label>
          <input
            name="date"
            type="date"
            value={formik.values.date}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="w-full rounded-xl border border-[#d7e5dc] bg-white px-3 py-2 text-sm text-[#1b3641]"
          />
          {formik.touched.date && formik.errors.date ? <p className="text-xs text-[#a73b21]">{formik.errors.date}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">Note</label>
          <input
            name="notes"
            value={formik.values.notes}
            onChange={formik.handleChange}
            placeholder="Note"
            className="w-full rounded-xl border border-[#d7e5dc] bg-white px-3 py-2 text-sm text-[#1b3641]"
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-lg border border-[#f8cfc4] bg-[#fff3ef] px-3 py-2 text-sm text-[#a73b21]">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={createLedgerEntryMutation.isPending}
        className="rounded-xl bg-[#046c1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#035519] disabled:opacity-60"
      >
        {createLedgerEntryMutation.isPending ? "Saving..." : "Add entry"}
      </button>
    </form>
  );
}
