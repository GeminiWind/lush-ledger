"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useFormik } from "formik";
import { tr } from "@/lib/i18n";

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
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [warningEnabled, setWarningEnabled] = useState(true);
  const [warnAt, setWarnAt] = useState("80");
  const [selectedIcon, setSelectedIcon] = useState(allIconChoices[0]);
  const [iconSearch, setIconSearch] = useState("");

  const currencyHint = useMemo(() => {
    if (currency === "VND") {
      return tr(language, "Formatted in Vietnamese Dong (VND)", "Định dạng theo Việt Nam Đồng (VND)");
    }
    return tr(language, `Formatted in ${currency}`, `Định dạng theo ${currency}`);
  }, [currency, language]);

  const resetUiState = useCallback(() => {
    setError(null);
    setLoading(false);
    setWarningEnabled(true);
    setWarnAt("80");
    setSelectedIcon(allIconChoices[0]);
    setIconSearch("");
  }, []);

  const filteredIcons = useMemo(() => {
    const query = iconSearch.trim().toLowerCase();
    if (!query) {
      return allIconChoices;
    }

    return allIconChoices.filter((icon) => icon.toLowerCase().includes(query));
  }, [iconSearch]);

  const formik = useFormik({
    initialValues: {
      name: "",
      monthlyLimit: "0",
    },
    validate: (values) => {
      const errors: { name?: string; monthlyLimit?: string } = {};
      if (!values.name.trim()) {
        errors.name = tr(language, "Category name is required.", "Tên danh mục là bắt buộc.");
      }
      if (parseAmount(values.monthlyLimit) < 0) {
        errors.monthlyLimit = tr(language, "Monthly limit must be zero or greater.", "Hạn mức tháng phải lớn hơn hoặc bằng 0.");
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
          monthlyLimit: parseAmount(values.monthlyLimit),
          warningEnabled,
          warnAt: Number(warnAt || 80),
        }),
      });

      setLoading(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || tr(language, "Failed to create category.", "Không thể tạo danh mục."));
        return;
      }

      setIsOpen(false);
      resetUiState();
      helpers.resetForm();
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
          {tr(language, "Add New Category", "Thêm danh mục mới")}
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
                  {tr(language, "Create New Category", "Tạo danh mục mới")}
                </h2>
                <p className="mt-2 text-[#49636f]">{tr(language, "Define a new boutique spending segment", "Tạo một nhóm chi tiêu mới")}</p>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="ml-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                    {tr(language, "Category Name", "Tên danh mục")} <span className="text-[#a73b21]">*</span>
                  </label>
                    <input
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={tr(language, "e.g., Luxury Travel", "ví dụ: Du lịch cao cấp")}
                      className="w-full rounded-2xl border-none bg-[#e7f6ff] px-6 py-4 text-base text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/40"
                    />
                  {formik.touched.name && formik.errors.name ? (
                    <p className="ml-2 text-xs text-[#a73b21]">{formik.errors.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="ml-2 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                    {tr(language, "Monthly Spending Limit", "Hạn mức chi tiêu tháng")}
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

                <div className="space-y-3">
                  <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-[#e7f6ff] px-4 py-3">
                    <div>
                      <label className="ml-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                        {tr(language, "Over-expense Warning", "Cảnh báo vượt chi")}
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
                          {warningEnabled ? tr(language, "Enabled", "Bật") : tr(language, "Disabled", "Tắt")}
                        </span>
                      </div>
                    </div>

                    <div className="w-24">
                      <label className="ml-1 block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                        {tr(language, "Warn At", "Cảnh báo tại")}
                      </label>
                      <input
                        value={`${warnAt}%`}
                        onChange={(event) => setWarnAt(event.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
                        className="mt-2 w-full rounded-xl border-none bg-white px-3 py-2 text-center font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/40"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="ml-2 flex items-center justify-between gap-2">
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                      {tr(language, "Iconography", "Biểu tượng")}
                    </label>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f6ff] px-2.5 py-1 text-xs font-semibold text-[#49636f]">
                      <span className="material-symbols-outlined text-sm">{selectedIcon}</span>
                      {selectedIcon}
                    </span>
                  </div>

                  <div className="space-y-3 rounded-2xl bg-[#e7f6ff] p-3">
                    <div className="relative">
                      <span className="pointer-events-none material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#647e8c]">
                        search
                      </span>
                      <input
                        value={iconSearch}
                        onChange={(event) => setIconSearch(event.target.value)}
                        placeholder={tr(language, "Search icons (flight, home, savings...)", "Tìm biểu tượng (flight, home, savings...)")}
                        className="w-full rounded-xl border border-[#d7e8f3] bg-white py-2 pl-10 pr-3 text-sm text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#2e7d32]/30"
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto rounded-xl border border-white/80 bg-white/80 p-3 pr-2">
                      {filteredIcons.length === 0 ? (
                        <p className="py-6 text-center text-sm text-[#6f8793]">{tr(language, "No icons match your search.", "Không có biểu tượng phù hợp.")}</p>
                      ) : (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                          {filteredIcons.map((icon) => {
                            const selected = selectedIcon === icon;
                            return (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => setSelectedIcon(icon)}
                                className={`flex h-11 w-11 items-center justify-center rounded-lg transition ${
                                  selected
                                    ? "bg-[#2e7d32] text-[#eaffe2]"
                                    : "bg-[#f5fbff] text-[#49636f] hover:bg-[#dff2e6] hover:text-[#2e7d32]"
                                }`}
                                title={icon}
                                aria-label={tr(language, `Select ${icon} icon`, `Chọn biểu tượng ${icon}`)}
                              >
                                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
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
                    {tr(language, "Cancel", "Hủy")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[1.4] rounded-2xl bg-[linear-gradient(145deg,#2e7d32_0%,#006118_100%)] px-6 py-4 font-bold text-[#eaffe2] shadow-[0_16px_28px_-12px_rgba(0,111,29,0.4)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? tr(language, "Adding Category...", "Đang thêm danh mục...") : tr(language, "Add Category", "Thêm danh mục")}
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
