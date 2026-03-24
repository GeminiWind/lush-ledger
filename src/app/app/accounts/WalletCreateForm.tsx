"use client";

import { getDictionary } from "@/lib/i18n";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormik } from "formik";

type Props = {
  language: string;
};

const toPlainNumber = (value: string) => {
  const normalized = value.replace(/[^\d]/g, "");
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export default function WalletCreateForm({ language }: Props) {
  const t = getDictionary(language);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      openingBalance: "",
      setAsDefault: true,
    },
    validate: (values) => {
      const errors: { name?: string; openingBalance?: string } = {};
      if (!values.name.trim()) {
        errors.name = t.walletNameRequired;
      }
      const balance = toPlainNumber(values.openingBalance);
      if (!Number.isFinite(balance) || balance < 0) {
        errors.openingBalance = t.walletInvalidBalance;
      }
      return errors;
    },
    onSubmit: async (values, helpers) => {
      setError(null);
      setLoading(true);

      const payload = {
        name: values.name.trim(),
        type: "cash",
        openingBalance: toPlainNumber(values.openingBalance),
        setAsDefault: values.setAsDefault,
      };

      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t.walletCreateFailed);
        return;
      }

      helpers.resetForm();
      setOpen(false);
      router.refresh();
    },
  });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError(null);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-[#006f1d] px-6 py-3 font-bold text-[#eaffe2] shadow-lg shadow-[#006f1d]/20 hover:brightness-105"
      >
        <span className="material-symbols-outlined">add_card</span>
        <span>{t.accountsNewWallet}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] bg-[#e7f6ff] p-8 shadow-2xl md:p-10">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#006f1d]/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#60622d]/10 blur-3xl" />

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-6 top-6 grid h-10 w-10 place-items-center rounded-full bg-white text-[#49636f] hover:bg-[#dcf1fd]"
              aria-label={t.walletCloseDialog}
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="relative z-10 space-y-8">
              <div className="space-y-2 pr-12">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#006f1d]">{t.walletDialogTag}</p>
                <h2 className="font-[var(--font-manrope)] text-4xl font-extrabold tracking-tight text-[#1b3641]">{t.walletDialogTitle}</h2>
                <p className="max-w-xl text-sm text-[#49636f]">{t.walletDialogBody}</p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#1b3641]">
                    {t.walletDialogNameLabel} <span className="text-[#a73b21]">*</span>
                  </label>
                  <input
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t.walletDialogNamePlaceholder}
                    className="w-full rounded-2xl border-none bg-white px-5 py-4 text-lg font-medium text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                  />
                  {formik.touched.name && formik.errors.name ? <p className="text-xs text-[#a73b21]">{formik.errors.name}</p> : null}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#1b3641]">{t.walletDialogBalanceLabel}</label>
                  <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-5 text-2xl font-bold text-[#006f1d]">{t.walletCurrencyPrefix}</span>
                    <input
                      name="openingBalance"
                      value={formik.values.openingBalance}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/[^\d]/g, "");
                        formik.setFieldValue("openingBalance", digits);
                      }}
                      onBlur={formik.handleBlur}
                      inputMode="numeric"
                      placeholder={t.walletDialogBalancePlaceholder}
                      className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-5 font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                    />
                  </div>
                  <p className="text-[11px] font-medium tracking-wide text-[#49636f]/80">{t.walletDialogBalanceHint}</p>
                  {formik.touched.openingBalance && formik.errors.openingBalance ? (
                    <p className="text-xs text-[#a73b21]">{formik.errors.openingBalance}</p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#006f1d]/10 text-[#006f1d]">
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-[#1b3641]">{t.walletDialogDefaultTitle}</p>
                      <p className="text-xs text-[#49636f]">{t.walletDialogDefaultBody}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => formik.setFieldValue("setAsDefault", !formik.values.setAsDefault)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                      formik.values.setAsDefault ? "bg-[#006f1d]" : "bg-[#9bb6c4]"
                    }`}
                    aria-label={t.walletDialogDefaultTitle}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        formik.values.setAsDefault ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {error ? <div className="rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-2 text-sm text-[#a73b21]">{error}</div> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#006f1d] to-[#006118] px-6 py-4 text-base font-extrabold text-[#eaffe2] shadow-[0_20px_34px_-18px_rgba(0,111,29,0.6)] hover:brightness-105 disabled:opacity-70"
                >
                  <span>{loading ? t.walletDialogCreating : t.walletDialogCreateAction}</span>
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
