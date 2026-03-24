"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";

export default function WalletCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      type: "cash",
      openingBalance: "0",
    },
    validate: (values) => {
      const errors: { name?: string } = {};
      if (!values.name.trim()) {
        errors.name = "Wallet name is required.";
      }
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setError(null);
      setLoading(true);

      const payload = {
        name: values.name.trim(),
        type: values.type,
        openingBalance: values.openingBalance.replaceAll(",", "").replaceAll(".", ""),
      };

      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create wallet.");
        return;
      }

      helpers.resetForm();
      router.refresh();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-3 rounded-2xl bg-white p-6 shadow-[0_12px_28px_-18px_rgba(27,54,65,0.35)]">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">
            Wallet Name <span className="text-[#a73b21]">*</span>
          </label>
          <input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Wallet name"
            className="w-full rounded-xl border-none bg-[#e7f6ff] px-4 py-3 text-sm text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
          />
          {formik.touched.name && formik.errors.name ? <p className="text-xs text-[#a73b21]">{formik.errors.name}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">Type</label>
          <select
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            className="w-full rounded-xl border-none bg-[#e7f6ff] px-4 py-3 text-sm text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
          >
            <option value="cash">Cash</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">Opening Balance</label>
          <input
            name="openingBalance"
            value={formik.values.openingBalance}
            onChange={formik.handleChange}
            placeholder="Opening balance"
            className="w-full rounded-xl border-none bg-[#e7f6ff] px-4 py-3 text-sm text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-2 text-sm text-[#a73b21]">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-[#006f1d] px-5 py-2.5 text-sm font-bold text-[#eaffe2] shadow-[0_10px_20px_-12px_rgba(0,111,29,0.55)] hover:brightness-105 disabled:opacity-70"
      >
        <span className="material-symbols-outlined text-base">add_card</span>
        <span>{loading ? "Creating..." : "Create Wallet"}</span>
      </button>
    </form>
  );
}
