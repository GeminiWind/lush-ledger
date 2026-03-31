"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CategoryForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (values: { name: string; monthlyLimit: string }) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          monthlyLimit: values.monthlyLimit,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create category.");
      }
    },
    onSuccess: async () => {
      formik.resetForm();
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : "Failed to create category.");
    },
  });

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
    onSubmit: async (values) => {
      setError(null);
      createCategoryMutation.mutate(values);
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
        disabled={createCategoryMutation.isPending}
        className="rounded-xl bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300 disabled:opacity-60"
      >
        {createCategoryMutation.isPending ? "Saving..." : "Add category"}
      </button>
    </form>
  );
}
