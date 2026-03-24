"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";

type Option = {
  id: string;
  name: string;
};

type Props = {
  accounts: Option[];
  categories: Option[];
};

const today = new Date().toISOString().slice(0, 10);

export default function LedgerEntryForm({ accounts, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!values.amount || Number(values.amount) <= 0) {
        errors.amount = "Amount is required.";
      }
      if (!values.date) {
        errors.date = "Date is required.";
      }
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setError(null);
      setLoading(true);

      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Could not create transaction.");
        return;
      }

      helpers.resetForm({ values: { ...formik.initialValues, date: today, type: "expense" } });
      router.refresh();
    },
  });

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
            type="number"
            step="0.01"
            min="0"
            value={formik.values.amount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Amount"
            className="w-full rounded-xl border border-[#d7e5dc] bg-white px-3 py-2 text-sm text-[#1b3641]"
          />
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
        disabled={loading}
        className="rounded-xl bg-[#046c1f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#035519] disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add entry"}
      </button>
    </form>
  );
}
