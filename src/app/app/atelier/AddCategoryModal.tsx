"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormik } from "formik";
import { getDictionary } from "@/lib/i18n";
import toast from "react-hot-toast";

const allIconChoices = [
  "restaurant",
  "shopping_bag",
  "commute",
  "fitness_center",
  "medical_services",
  "home",
  "payments",
  "celebration",
  "local_cafe",
  "local_bar",
  "local_dining",
  "lunch_dining",
  "breakfast_dining",
  "bakery_dining",
  "fastfood",
  "icecream",
  "hotel",
  "flight",
  "train",
  "directions_car",
  "two_wheeler",
  "local_taxi",
  "directions_bus",
  "directions_subway",
  "movie",
  "sports_esports",
  "music_note",
  "headphones",
  "palette",
  "brush",
  "school",
  "book",
  "menu_book",
  "subscriptions",
  "devices",
  "phone_iphone",
  "laptop_mac",
  "tv",
  "home_work",
  "apartment",
  "chair",
  "construction",
  "electric_bolt",
  "water_drop",
  "shield",
  "health_and_safety",
  "medication",
  "spa",
  "pets",
  "child_care",
  "family_restroom",
  "redeem",
  "card_giftcard",
  "savings",
  "account_balance",
  "trending_up",
  "volunteer_activism",
  "public",
  "language",
  "work",
  "business_center",
  "inventory_2",
  "auto_awesome",
  "rocket_launch",
  "event",
  "calendar_month",
  "receipt_long",
  "category",
];

const parseAmount = (value: string) => {
  const normalized = value.replaceAll(",", "").trim();
  const asNumber = Number(normalized);
  return Number.isFinite(asNumber) ? asNumber : 0;
};

type Props = {
  currency: string;
  language: string;
};

export default function AddCategoryModal({ currency, language }: Props) {
  const router = useRouter();
  const t = getDictionary(language);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [keepNextMonth, setKeepNextMonth] = useState(true);
  const [warningEnabled, setWarningEnabled] = useState(true);
  const [warnAt, setWarnAt] = useState("80");
  const [selectedIcon, setSelectedIcon] = useState(allIconChoices[0]);

  const currencyHint = useMemo(() => {
    if (currency === "VND") {
      return t.atelierCurrencyHintVnd;
    }
    return t.atelierCurrencyHintTemplate.replace("{currency}", currency);
  }, [currency, t.atelierCurrencyHintTemplate, t.atelierCurrencyHintVnd]);

  const resetUiState = useCallback(() => {
    setError(null);
    setLoading(false);
    setKeepNextMonth(true);
    setWarningEnabled(true);
    setWarnAt("80");
    setSelectedIcon(allIconChoices[0]);
  }, []);

  const formik = useFormik({
    initialValues: {
      name: "",
      monthlyLimit: "0",
    },
    validate: (values) => {
      const errors: { name?: string; monthlyLimit?: string } = {};
      if (!values.name.trim()) {
        errors.name = t.atelierCategoryNameRequired;
      }
      if (parseAmount(values.monthlyLimit) < 0) {
        errors.monthlyLimit = t.atelierMonthlyLimitNonNegative;
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
          name: values.name.trim(),
          icon: selectedIcon,
          monthlyLimit: parseAmount(values.monthlyLimit),
          keepLimitNextMonth: keepNextMonth,
          warningEnabled,
          warnAt: Number(warnAt || 80),
        }),
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || t.atelierCreateCategoryFailed);
        return;
      }

      setIsOpen(false);
      resetUiState();
      helpers.resetForm();
      toast.success(t.atelierCreateCategorySuccess);
      router.refresh();
    },
  });

  const closeModal = useCallback(() => {
    setIsOpen(false);
    resetUiState();
    formik.resetForm();
  }, [formik, resetUiState]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeModal]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[#c7dce9] bg-white p-6 transition-all duration-300 hover:border-[#2e7d32]/40 hover:bg-[#edf8f0]"
      >
        <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#eef7ff] text-[#6f8793] transition-all group-hover:bg-[#2e7d32] group-hover:text-[#eaffe2]">
          <span className="material-symbols-outlined text-2xl">add</span>
        </div>
        <span className="font-[var(--font-manrope)] text-base font-bold text-[#49636f] group-hover:text-[#2e7d32]">
          {t.atelierAddNewCategory}
        </span>
      </button>

      {isOpen && typeof window !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b3641]/60 p-6 backdrop-blur-sm"
              onMouseDown={closeModal}
            >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_80px_-22px_rgba(27,54,65,0.55)]"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="p-8 sm:p-10">
              <div className="mb-8 text-center">
                <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-[-0.02em] text-[#1b3641]">
                  {t.atelierCreateNewCategory}
                </h2>
                <p className="mt-2 text-[#49636f]">{t.atelierCategorySegment}</p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                    {t.atelierCategoryNameLabel} <span className="text-[#a73b21]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t.atelierCategoryNamePlaceholder}
                      className="w-full rounded-2xl border-none bg-[#e7f6ff] px-6 py-4 pr-16 text-base text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/40"
                    />
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#2e7d32]/55">
                      <span className="material-symbols-outlined text-[20px]">{selectedIcon}</span>
                    </div>
                  </div>
                  {formik.touched.name && formik.errors.name ? (
                    <p className="ml-2 text-xs text-[#a73b21]">{formik.errors.name}</p>
                  ) : null}
                </div>

                <div className="space-y-3 pt-1">
                  <label className="ml-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                    {t.atelierIconography}
                  </label>
                  <div className="max-h-56 overflow-y-auto rounded-2xl bg-[#e7f6ff]/60 p-4 pr-3">
                    <div className="grid grid-cols-5 gap-3 sm:grid-cols-7">
                      {allIconChoices.map((icon) => {
                        const selected = selectedIcon === icon;
                        return (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setSelectedIcon(icon)}
                            className={`aspect-square rounded-xl transition-all hover:scale-105 active:scale-95 ${
                              selected
                                ? "bg-[#2e7d32] text-[#eaffe2] shadow-[0_4px_12px_rgba(0,111,29,0.2)]"
                                : "bg-white/70 text-[#49636f] hover:bg-white"
                            }`}
                            title={icon}
                            aria-label={t.atelierSelectIconAriaTemplate.replace("{icon}", icon)}
                          >
                            <span className="material-symbols-outlined text-2xl">{icon}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                    {t.atelierMonthlySpendingLimit}
                  </label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-[#647e8c]">
                      {currency === "VND" ? "VND" : currency}
                    </span>
                    <input
                      name="monthlyLimit"
                      type="text"
                      value={formik.values.monthlyLimit}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full rounded-2xl border-none bg-[#e7f6ff] py-4 pl-20 pr-6 text-base font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/40"
                    />
                  </div>
                  {formik.touched.monthlyLimit && formik.errors.monthlyLimit ? (
                    <p className="ml-2 text-xs text-[#a73b21]">{formik.errors.monthlyLimit}</p>
                  ) : null}
                  <p className="ml-2 text-[11px] italic text-[#6f8793]">{currencyHint}</p>
                </div>

                <div className="space-y-3 rounded-2xl border border-[#d7e8f3] bg-[#f7fcff] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-[#1b3641]">{t.atelierKeepLimitNextMonth}</span>
                    <button
                      type="button"
                      onClick={() => setKeepNextMonth((value) => !value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        keepNextMonth ? "bg-[#2e7d32]" : "bg-[#9bb6c4]"
                      }`}
                      aria-pressed={keepNextMonth}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          keepNextMonth ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#6f8793]">{t.atelierKeepLimitNextMonthHint}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-[#e7f6ff] px-4 py-3">
                    <div>
                      <label className="ml-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                        {t.atelierOverExpenseWarning}
                      </label>
                      <div className="mt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setWarningEnabled((value) => !value)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                            warningEnabled ? "bg-[#2e7d32]" : "bg-[#9bb6c4]"
                          }`}
                          aria-pressed={warningEnabled}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                              warningEnabled ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                        <span className="text-sm font-semibold text-[#1b3641]">
                          {warningEnabled ? t.atelierEnabled : t.atelierDisabled}
                        </span>
                      </div>
                    </div>

                    <div className="w-24">
                      <label className="ml-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                        {t.atelierWarnAt}
                      </label>
                      <input
                        value={`${warnAt}%`}
                        onChange={(event) => setWarnAt(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                        className="mt-2 w-full rounded-xl border-none bg-white px-3 py-2 text-center font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/40"
                      />
                    </div>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-[#f5c8bf] bg-[#fff3ef] px-4 py-3 text-sm text-[#a73b21]">
                    {error}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 pt-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-2xl bg-[#d4ecf9] px-6 py-4 font-bold text-[#1b3641] transition hover:bg-[#c7e3f3]"
                  >
                    {t.atelierActionCancel}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[1.4] rounded-2xl bg-[linear-gradient(145deg,#2e7d32_0%,#006118_100%)] px-6 py-4 font-bold text-[#eaffe2] shadow-[0_16px_28px_-12px_rgba(0,111,29,0.4)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? t.atelierAddingCategory : t.atelierAddCategory}
                  </button>
                </div>
              </form>
            </div>

            <div className="h-2 w-full bg-gradient-to-r from-[#2e7d32] via-[#83e881] to-[#4d626c]" />
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}
