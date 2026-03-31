"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";
import { getDictionary } from "@/lib/i18n";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type Props = {
  language: string;
  initialValues: {
    name: string;
    email: string;
    currency: string;
    language: string;
    theme: string;
  };
};

const themes = [
  {
    value: "light",
    key: "settingsLightMode",
    preview: "bg-[#f4faff]",
    activeIcon: "check_circle",
  },
  {
    value: "dark",
    key: "settingsDarkMode",
    preview: "bg-[#041015]",
    activeIcon: "check_circle",
  },
  {
    value: "system",
    key: "settingsSystemDefault",
    preview: "bg-gradient-to-br from-[#f4faff] to-[#041015]",
    activeIcon: "check_circle",
  },
] as const;

export default function SettingsForm({ language, initialValues }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const t = getDictionary(language);
  const queryClient = useQueryClient();

  const updateSettingsMutation = useMutation({
    mutationFn: async (values: Props["initialValues"]) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.settingsSaveFailed);
      }
    },
    onSuccess: async () => {
      setSaved(true);
      toast.success(t.settingsSaved);
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t.settingsSaveFailed);
    },
  });

  const formik = useFormik({
    initialValues,
    validate: (values) => {
      const errors: { name?: string; currency?: string; language?: string; theme?: string } = {};

      if (!values.name.trim() || values.name.trim().length < 2) {
        errors.name = t.errorNameRequired;
      }

      if (!values.currency) {
        errors.currency = t.errorCurrencyRequired;
      }

      if (!values.language) {
        errors.language = t.errorLanguageRequired;
      }

      if (!values.theme) {
        errors.theme = t.errorThemeRequired;
      }

      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      setSaved(false);
      updateSettingsMutation.mutate(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section className="space-y-6 lg:col-span-8">
          <article className="rounded-xl bg-[#e7f6ff] p-8">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{t.settingsThemeTitle}</h2>
              <span className="text-xs font-medium text-[#49636f]">{t.settingsVisualIdentity}</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {themes.map((theme) => {
                const selected = formik.values.theme === theme.value;
                return (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => formik.setFieldValue("theme", theme.value)}
                    className={`rounded-xl p-5 text-left transition ${
                      selected
                        ? "border-2 border-[#006f1d] bg-white shadow-sm"
                        : "border-2 border-transparent bg-[#f4faff] hover:-translate-y-0.5"
                    }`}
                  >
                    <div className={`mb-4 h-20 rounded-lg ${theme.preview}`} />
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${selected ? "text-[#1b3641]" : "text-[#49636f]"}`}>{t[theme.key]}</span>
                      <span className={`material-symbols-outlined ${selected ? "text-[#006f1d]" : "text-[#9bb6c4]"}`}>
                        {selected ? theme.activeIcon : "circle"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            {formik.touched.theme && formik.errors.theme ? (
              <p className="mt-3 text-xs text-[#a73b21]">{formik.errors.theme}</p>
            ) : null}
          </article>

          <article className="rounded-xl bg-white p-8">
            <h2 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{t.settingsProfileTitle}</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1 ml-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">
                  {t.settingsFullName} <span className="text-[#a73b21]">*</span>
                </label>
                <input
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full rounded-xl border-none bg-[#e7f6ff] px-5 py-4 text-[#1b3641] outline-none ring-2 ring-transparent focus:ring-[#006f1d]/25"
                />
                {formik.touched.name && formik.errors.name ? (
                  <p className="mt-1 ml-1 text-xs text-[#a73b21]">{formik.errors.name}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 ml-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">{t.settingsEmail}</label>
                <input
                  value={formik.values.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border-none bg-[#edf4ef] px-5 py-4 text-[#647e8c] outline-none"
                />
              </div>
            </div>
          </article>
        </section>

        <section className="space-y-6 lg:col-span-4">
          <article className="rounded-xl bg-[#006f1d] p-8 text-[#eaffe2]">
            <h2 className="font-[var(--font-manrope)] text-xl font-bold">{t.settingsCurrencyHub}</h2>
            <div className="mt-5">
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#d8ffe0]">
                {t.settingsCurrency} <span className="text-[#ffd8cd]">*</span>
              </label>
              <select
                name="currency"
                value={formik.values.currency}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full appearance-none rounded-xl border-none bg-white px-4 py-3 font-semibold text-[#1b3641] outline-none ring-2 ring-transparent focus:ring-white/40"
              >
                <option value="VND">Vietnamese Dong (VND)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="JPY">Japanese Yen (JPY)</option>
              </select>
              {formik.touched.currency && formik.errors.currency ? (
                <p className="mt-2 text-xs text-[#ffd8cd]">{formik.errors.currency}</p>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl bg-[#e7f6ff] p-8">
            <h2 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{t.settingsLanguageTitle}</h2>
            <div className="mt-5">
              <label className="mb-1 block text-xs font-bold uppercase tracking-[0.12em] text-[#6f8793]">
                {t.settingsCurrentDisplay} <span className="text-[#a73b21]">*</span>
              </label>
              <select
                name="language"
                value={formik.values.language}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full appearance-none rounded-xl border-none bg-white px-4 py-3 font-semibold text-[#1b3641] outline-none ring-2 ring-transparent focus:ring-[#006f1d]/25"
              >
                <option value="en-US">English (US)</option>
                <option value="vi-VN">Tiếng Việt (VN)</option>
                <option value="fr-FR">Français (FR)</option>
                <option value="ja-JP">日本語 (JP)</option>
              </select>
              {formik.touched.language && formik.errors.language ? (
                <p className="mt-2 text-xs text-[#a73b21]">{formik.errors.language}</p>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl border-2 border-dashed border-[#c7dce9] bg-white p-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006f1d]">security</span>
            <p className="text-sm font-bold text-[#1b3641]">{t.settingsPrivacyTitle}</p>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#49636f]">
              {t.settingsPrivacyBody}
            </p>
          </article>
        </section>
      </div>

      <section className="flex flex-col items-start justify-between gap-4 border-t border-[#d8e8f3] pt-8 md:flex-row md:items-center">
        <p className="text-sm text-[#6f8793]">{t.settingsFooterHint}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              formik.resetForm();
              setError(null);
              setSaved(false);
            }}
            className="rounded-xl bg-[#d4ecf9] px-6 py-3 text-sm font-bold text-[#1b3641] hover:bg-[#c5e4f4]"
          >
            {t.actionReset}
          </button>
          <button
            type="submit"
            disabled={updateSettingsMutation.isPending}
            className="rounded-xl bg-[linear-gradient(145deg,#2e7d32_0%,#006118_100%)] px-6 py-3 text-sm font-bold text-[#eaffe2] shadow-[0_12px_28px_-14px_rgba(0,111,29,0.45)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {t.actionSaveSettings}
          </button>
        </div>
      </section>

      {saved ? <p className="text-sm font-semibold text-[#0f7a2f]">{t.settingsSaved}</p> : null}
      {error ? <p className="text-sm font-semibold text-[#a73b21]">{error}</p> : null}
    </form>
  );
}
