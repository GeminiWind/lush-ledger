"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function AccountForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createAccountMutation = useMutation({
    mutationFn: async (values: { name: string; type: string; openingBalance: string }) => {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create account.");
      }
    },
    onSuccess: async () => {
      formik.resetForm();
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : "Failed to create account.");
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      type: "checking",
      openingBalance: "0",
    },
    validate: (values) => {
      const errors: { name?: string } = {};
      if (!values.name.trim()) {
        errors.name = "Account name is required.";
      }
      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      createAccountMutation.mutate(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
            Account Name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Account name"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
          />
          {formik.touched.name && formik.errors.name ? <p className="text-xs text-red-400">{formik.errors.name}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Type</label>
          <select
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Opening Balance</label>
          <input
            name="openingBalance"
            type="number"
            step="0.01"
            value={formik.values.openingBalance}
            onChange={formik.handleChange}
            placeholder="Opening balance"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
          />
        </div>
      </div>
      {error ? (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      <button
        disabled={createAccountMutation.isPending}
        className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
      >
        {createAccountMutation.isPending ? "Saving..." : "Add account"}
      </button>
    </form>
  );
}
