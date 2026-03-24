"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";

export default function CategoryForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      monthlyLimit: "0",
    },
    validate: (values) => {
      const errors: { name?: string } = {};
      if (!values.name.trim()) {
        errors.name = "Category name is required.";
      }
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setError(null);
      setLoading(true);

      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          monthlyLimit: values.monthlyLimit,
        }),
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || "Failed to create category.");
        return;
      }

      helpers.resetForm();
      router.refresh();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-300">
            Category Name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Category name"
            className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm"
          />
          {formik.touched.name && formik.errors.name ? <p className="text-xs text-red-400">{formik.errors.name}</p> : null}
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-300">Monthly Limit</label>
          <input
            name="monthlyLimit"
            type="number"
            step="0.01"
            value={formik.values.monthlyLimit}
            onChange={formik.handleChange}
            placeholder="Monthly limit"
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
        disabled={loading}
        className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
      >
        {loading ? "Saving..." : "Add category"}
      </button>
    </form>
  );
}
