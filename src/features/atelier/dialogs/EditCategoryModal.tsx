"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormik } from "formik";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { formatCurrencyInput, getCurrencyInputSuggestions, parseCurrencyInput } from "@/lib/format";
import type { EditCategoryModalProps } from "@/features/atelier/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

export default function EditCategoryModal({ category, currency, language }: EditCategoryModalProps) {
  const router = useRouter();
  const t = useNamespacedTranslation("atelier", language);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keepNextMonth, setKeepNextMonth] = useState(true);
  const [warningEnabled, setWarningEnabled] = useState(category.warningEnabled);
  const [warnAt, setWarnAt] = useState(String(category.warnAt || 80));
  const [selectedIcon, setSelectedIcon] = useState(category.icon || "category");
  const [iconDialogOpen, setIconDialogOpen] = useState(false);
  const [iconSearch, setIconSearch] = useState("");
  const queryClient = useQueryClient();

  const currencyHint = useMemo(() => {
    if (currency === "VND") {
      return t("atelier.atelierCurrencyHintVnd");
    }
    return t("atelier.atelierCurrencyHintTemplate").replace("{currency}", currency);
  }, [currency, t]);

  const updateCategoryMutation = useMutation({
    mutationFn: async (values: { name: string; monthlyLimit: string }) => {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          icon: selectedIcon,
          monthlyLimit: parseCurrencyInput(values.monthlyLimit),
          warningEnabled,
          warnAt: Number(warnAt || 80),
          keepLimitNextMonth: keepNextMonth,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("atelier.atelierEditCategoryFailed"));
      }
    },
    onSuccess: async () => {
      setIsOpen(false);
      toast.success(t("atelier.atelierEditCategorySuccess"));
      await queryClient.invalidateQueries({ queryKey: ["atelier"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t("atelier.atelierEditCategoryFailed"));
    },
  });

  const formik = useFormik({
    initialValues: {
      name: category.name,
      monthlyLimit: formatCurrencyInput(String(category.limit), currency),
    },
    enableReinitialize: true,
    validate: (values) => {
      const errors: { name?: string; monthlyLimit?: string } = {};
      if (!values.name.trim()) {
        errors.name = t("atelier.atelierCategoryNameRequired");
      }
      if (parseCurrencyInput(values.monthlyLimit) < 0) {
        errors.monthlyLimit = t("atelier.atelierMonthlyLimitNonNegative");
      }
      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      updateCategoryMutation.mutate(values);
    },
  });

  const openModal = useCallback(() => {
    setError(null);
    setKeepNextMonth(true);
    setWarningEnabled(category.warningEnabled);
    setWarnAt(String(category.warnAt || 80));
    setSelectedIcon(category.icon || "category");
    setIconSearch("");
    setIconDialogOpen(false);
    formik.setValues({ name: category.name, monthlyLimit: formatCurrencyInput(String(category.limit), currency) });
    setIsOpen(true);
  }, [category.icon, category.limit, category.name, category.warnAt, category.warningEnabled, currency, formik]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setError(null);
    setIconDialogOpen(false);
  }, []);

  const filteredIcons = useMemo(() => {
    const query = iconSearch.trim().toLowerCase();
    if (!query) {
      return allIconChoices;
    }
    return allIconChoices.filter((icon) => icon.toLowerCase().includes(query));
  }, [iconSearch]);

  const monthlyLimitSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.monthlyLimit, currency);
  }, [currency, formik.values.monthlyLimit]);

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
  }, [closeModal, isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="rounded-full bg-[#eef7ff] p-2 text-[#49636f] transition hover:bg-[#dbeefb]"
        aria-label={`${t("atelier.atelierActionEdit")} ${category.name}`}
      >
        <span className="material-symbols-outlined text-base">edit</span>
      </button>

      {isOpen && typeof window !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b3641]/30 p-4 backdrop-blur-[2px]"
              onMouseDown={closeModal}
            >
              <div
                className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-[0_32px_64px_-12px_rgba(27,54,65,0.2)]"
                onMouseDown={(event) => event.stopPropagation()}
              >
                <div className="px-8 pt-9 pb-6 sm:px-10">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-[var(--font-manrope)] text-xs font-bold uppercase tracking-[0.2em] text-[#2e7d32]">
                      Lush Ledger
                    </span>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="grid h-10 w-10 place-items-center rounded-full text-[#647e8c] transition hover:bg-[#eef7ff]"
                      aria-label={t("atelier.atelierActionCancel")}
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-[-0.02em] text-[#1b3641]">
                    {t("atelier.atelierEditCategoryTitleTemplate").replace("{name}", category.name)}
                  </h2>
                  <p className="mt-2 text-sm text-[#49636f]">{t("atelier.atelierEditCategorySubtitle")}</p>
                </div>

                <form onSubmit={formik.handleSubmit} className="space-y-7 px-8 pb-10 sm:px-10">
                  <div className="space-y-2">
                    <label className="ml-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#647e8c]">
                      {t("atelier.atelierCategoryNameLabel")}
                    </label>
                    <div className="relative">
                      <input
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className="w-full rounded-2xl border-none bg-[#e7f6ff] px-5 py-4 text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/40"
                      />
                      <button
                        type="button"
                        onClick={() => setIconDialogOpen(true)}
                        className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl bg-white text-[#2e7d32] shadow-sm transition hover:bg-[#edf8f0]"
                        title={t("atelier.atelierEditIconAria")}
                        aria-label={t("atelier.atelierEditIconAria")}
                      >
                        <span className="material-symbols-outlined text-[20px]">{selectedIcon}</span>
                      </button>
                    </div>
                    {formik.touched.name && formik.errors.name ? (
                      <p className="ml-1 text-xs text-[#a73b21]">{formik.errors.name}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#647e8c]">
                      {t("atelier.atelierMonthlySpendingLimit")}
                    </label>
                    <input
                      name="monthlyLimit"
                      value={formik.values.monthlyLimit}
                      onChange={(event) => {
                        formik.setFieldValue("monthlyLimit", formatCurrencyInput(event.target.value, currency));
                      }}
                      onBlur={formik.handleBlur}
                      className="w-full rounded-2xl border-none bg-[#e7f6ff] px-5 py-4 text-xl font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/40"
                    />
                    {monthlyLimitSuggestions.length ? (
                      <div className="ml-1 mt-2 flex flex-wrap items-center gap-2">
                        {monthlyLimitSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.value}
                            type="button"
                            onClick={() => formik.setFieldValue("monthlyLimit", formatCurrencyInput(String(suggestion.value), currency))}
                            className="rounded-full border border-[#cce4ef] bg-[#f5fcff] px-3 py-1 text-xs font-bold text-[#1b3641] transition hover:border-[#8dc4da] hover:bg-[#ebf8ff]"
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {formik.touched.monthlyLimit && formik.errors.monthlyLimit ? (
                      <p className="ml-1 text-xs text-[#a73b21]">{formik.errors.monthlyLimit}</p>
                    ) : null}
                    <p className="ml-1 text-[11px] italic text-[#6f8793]">{currencyHint}</p>
                  </div>

                  <div className="space-y-3 rounded-2xl border border-[#d7e8f3] bg-[#f7fcff] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-sm font-bold text-[#49636f]">{t("atelier.atelierKeepLimitNextMonth")}</label>
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
                    <p className="text-[11px] leading-relaxed text-[#6f8793]">{t("atelier.atelierKeepLimitNextMonthHint")}</p>
                  </div>

                  <div className="rounded-2xl border border-[#d7e8f3] bg-[#f7fcff] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#2e7d32]/10 text-[#2e7d32]">
                          <span className="material-symbols-outlined">notifications_active</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#1b3641]">{t("atelier.atelierOverExpenseWarning")}</h3>
                          <p className="text-xs text-[#6f8793]">{t("atelier.atelierWarningHint")}</p>
                        </div>
                      </div>
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
                    </div>

                    <div className="mt-5 flex items-center gap-4">
                      <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#d6e8f3]">
                        <div
                          className="h-full rounded-full bg-[#2e7d32]"
                          style={{ width: `${Math.min(Math.max(Number(warnAt || 0), 0), 100)}%` }}
                        />
                      </div>
                      <input
                        value={`${warnAt}%`}
                        onChange={(event) => setWarnAt(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                        className="w-20 rounded-xl border border-[#d7e8f3] bg-white px-3 py-2 text-center text-sm font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/30"
                      />
                    </div>
                  </div>

                  {error ? (
                    <div className="rounded-xl border border-[#f5c8bf] bg-[#fff3ef] px-4 py-3 text-sm text-[#a73b21]">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <button
                      type="submit"
                      disabled={updateCategoryMutation.isPending}
                      className="flex h-14 min-w-[220px] flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(145deg,#2e7d32_0%,#006118_100%)] px-6 text-sm font-bold text-[#eaffe2] shadow-[0_12px_28px_-12px_rgba(0,111,29,0.45)] transition hover:brightness-105 disabled:opacity-70"
                    >
                      <span className="material-symbols-outlined text-lg">done_all</span>
                      {updateCategoryMutation.isPending ? t("atelier.atelierActionSaving") : t("atelier.atelierSaveChanges")}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-2 text-sm font-bold text-[#6f8793] transition hover:text-[#a73b21]"
                    >
                      {t("atelier.atelierDiscard")}
                    </button>
                  </div>
                </form>

                {iconDialogOpen ? (
                  <div className="absolute inset-0 bg-white/95 p-6 sm:p-8">
                    <div className="flex items-center justify-between">
                      <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{t("atelier.atelierChooseIcon")}</h3>
                      <button
                        type="button"
                        onClick={() => setIconDialogOpen(false)}
                        className="grid h-9 w-9 place-items-center rounded-full text-[#647e8c] hover:bg-[#eef7ff]"
                        aria-label={t("atelier.atelierCloseIconPickerAria")}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <div className="relative mt-4">
                      <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#647e8c]">
                        search
                      </span>
                      <input
                        value={iconSearch}
                        onChange={(event) => setIconSearch(event.target.value)}
                        placeholder={t("atelier.atelierSearchIconsPlaceholder")}
                        className="w-full rounded-xl border border-[#d7e8f3] bg-white py-2.5 pl-10 pr-3 text-sm text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/30"
                      />
                    </div>

                    <div className="mt-4 max-h-[360px] overflow-y-auto rounded-2xl border border-[#d7e8f3] bg-[#f8fcff] p-3">
                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-8">
                        {filteredIcons.map((icon) => {
                          const selected = icon === selectedIcon;
                          return (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => {
                                setSelectedIcon(icon);
                                setIconDialogOpen(false);
                              }}
                              className={`grid h-10 w-10 place-items-center rounded-lg transition ${
                                selected
                                  ? "bg-[#2e7d32] text-[#eaffe2]"
                                  : "bg-white text-[#49636f] hover:bg-[#dff2e6] hover:text-[#2e7d32]"
                              }`}
                              title={icon}
                            >
                              <span className="material-symbols-outlined text-[19px]">{icon}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
