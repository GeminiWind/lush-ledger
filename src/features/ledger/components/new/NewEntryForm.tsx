"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { useFormik } from "formik";
import { dayOfMonth, nowDate, toISODate } from "@/lib/date";
import { formatCurrencyInput, getCurrencyInputSuggestions, parseCurrencyInput } from "@/lib/format";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { useUserSetting } from "@/features/settings/hooks/useUserSetting";
import type { NewEntryFormErrors, NewEntryFormProps, NewEntryFormValues } from "@/features/ledger/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const iconForCategory = (name: string) => {
  const value = name.toLowerCase();
  if (value.includes("food") || value.includes("dining") || value.includes("coffee")) return "restaurant";
  if (value.includes("rent") || value.includes("home") || value.includes("housing")) return "home";
  if (value.includes("grocer") || value.includes("market") || value.includes("shop")) return "shopping_cart";
  if (value.includes("travel") || value.includes("flight")) return "flight";
  if (value.includes("maint") || value.includes("repair") || value.includes("utility")) return "build";
  if (value.includes("entertain") || value.includes("ticket")) return "confirmation_number";
  return "payments";
};

const formatDateForApi = (date: Date) => toISODate(date);

const buildDateTimeWithCurrentTime = (value: Date) => {
  const selectedDate = new Date(value);
  if (Number.isNaN(selectedDate.getTime())) {
    return "";
  }

  const now = nowDate();
  selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return selectedDate.toISOString();
};

export default function NewEntryForm({ wallets = [], defaultWalletId, categories }: NewEntryFormProps) {
  const router = useRouter();
  const { currency, language } = useUserSetting();
  const t = useNamespacedTranslation("newEntry", language);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const categoryOptions = useMemo(() => categories.slice(0, 6), [categories]);

  const createTransactionMutation = useMutation({
    mutationFn: async (values: NewEntryFormValues) => {
      const date = values.date ? buildDateTimeWithCurrentTime(values.date) : "";
      const amount = parseCurrencyInput(values.amountDisplay);
      const description = values.description.trim();
      const note = values.note.trim();
      const notes = [description, note].filter(Boolean).join(" - ");

      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: values.walletId,
          categoryId: values.type === "expense" ? values.categoryId : "",
          type: values.type,
          amount,
          date,
          notes,
          recurring: {
            enabled: values.isRecurring,
            interval: values.recurringInterval,
            dayOfMonth: Number(values.recurringDayOfMonth || "1"),
            endDate: values.recurringEndDate ? formatDateForApi(values.recurringEndDate) : null,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("newEntry.txCreateFailed"));
      }
    },
    onSuccess: async () => {
      toast.success(t("newEntry.txCreateSuccess"));
      await queryClient.invalidateQueries({ queryKey: ["ledger"] });
      router.push("/app/ledger");
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t("newEntry.txCreateFailed"));
    },
  });

  const formik = useFormik<NewEntryFormValues>({
    initialValues: {
      type: "expense",
      amountDisplay: "",
      categoryId: categories[0]?.id || "",
      walletId: defaultWalletId || wallets[0]?.id || "",
      date: nowDate(),
      isRecurring: false,
      recurringInterval: "monthly",
      recurringDayOfMonth: String(dayOfMonth(nowDate())),
      recurringEndDate: null,
      description: "",
      note: "",
    },
    validate: (values) => {
      const errors: NewEntryFormErrors = {};
      const amount = parseCurrencyInput(values.amountDisplay);
      const recurringDay = Number(values.recurringDayOfMonth || "1");

      if (amount <= 0) {
        errors.amountDisplay = t("newEntry.txErrorAmountRequired");
      }

      if (!values.description.trim()) {
        errors.description = t("newEntry.txErrorDescriptionRequired");
      }

      if (!values.date) {
        errors.date = t("newEntry.txErrorDateRequired");
      }

      if (values.type === "income" && !values.walletId) {
        errors.walletId = t("newEntry.txErrorWalletRequired");
      }

      if (values.isRecurring && (!Number.isInteger(recurringDay) || recurringDay < 1 || recurringDay > 31)) {
        errors.recurringDayOfMonth = t("newEntry.txErrorRecurringDayRange");
      }

      if (values.isRecurring && values.recurringEndDate && values.date && values.recurringEndDate < values.date) {
        errors.recurringEndDate = t("newEntry.txErrorRecurringEndDate");
      }

      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      createTransactionMutation.mutate(values);
    },
  });

  const onAmountChange = (rawValue: string) => {
    formik.setFieldValue("amountDisplay", formatCurrencyInput(rawValue, currency));
  };

  const amountSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.amountDisplay, currency);
  }, [currency, formik.values.amountDisplay]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-10">
      <div className="space-y-2 text-center">
        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-[#7f97a4]">
          Transaction Amount <span className="text-[#a73b21]">*</span>
        </label>
        <div className="flex items-center justify-center">
          <span className="font-[var(--font-manrope)] text-4xl font-light text-[#7f97a4]">
            {currency === "VND" ? "VND" : currency}
          </span>
          <input
            name="amountDisplay"
            value={formik.values.amountDisplay}
            onChange={(event) => onAmountChange(event.target.value)}
            onBlur={() => formik.setFieldTouched("amountDisplay", true)}
            placeholder="0"
            inputMode="numeric"
            className="w-full bg-transparent p-0 text-center font-[var(--font-manrope)] text-6xl font-extrabold text-[#1b3641] placeholder:text-[#c2d8e5] outline-none"
          />
        </div>
        {amountSuggestions.length ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {amountSuggestions.map((suggestion) => (
              <button
                key={suggestion.value}
                type="button"
                onClick={() => formik.setFieldValue("amountDisplay", formatCurrencyInput(String(suggestion.value), currency))}
                className="rounded-full border border-[#cce4ef] bg-[#f5fcff] px-4 py-1.5 text-sm font-bold text-[#1b3641] transition hover:border-[#8dc4da] hover:bg-[#ebf8ff]"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        ) : null}
        {formik.touched.amountDisplay && formik.errors.amountDisplay ? (
          <p className="text-sm text-[#a73b21]">{formik.errors.amountDisplay}</p>
        ) : null}
        <div className="mx-auto h-0.5 w-1/3 rounded-full bg-[#d4ecf9]">
          <div className="h-full w-1/2 rounded-full bg-[#006f1d]" />
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">Type</label>
          <div className="grid grid-cols-2 rounded-xl bg-[#e7f6ff] p-1">
            <button
              type="button"
              onClick={() => formik.setFieldValue("type", "expense")}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                formik.values.type === "expense" ? "bg-white text-[#1b3641] shadow-sm" : "text-[#6f8793]"
              }`}
            >
              {t("newEntry.txTypeExpense")}
            </button>
            <button
              type="button"
              onClick={() => formik.setFieldValue("type", "income")}
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                formik.values.type === "income" ? "bg-white text-[#1b3641] shadow-sm" : "text-[#6f8793]"
              }`}
            >
              {t("newEntry.txTypeIncome")}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[#e7f6ff] px-4 py-3">
            <label className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">{t("newEntry.txRecurring")}</label>
            <button
              type="button"
              onClick={() => formik.setFieldValue("isRecurring", !formik.values.isRecurring)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                formik.values.isRecurring ? "bg-[#2e7d32]" : "bg-[#9bb6c4]"
              }`}
              aria-pressed={formik.values.isRecurring}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                  formik.values.isRecurring ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          {formik.values.isRecurring ? (
            <div className="grid grid-cols-1 gap-4 rounded-xl bg-[#f1f9ff] p-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f8793]">{t("newEntry.txFrequency")}</label>
                <select
                  value={formik.values.recurringInterval}
                  onChange={formik.handleChange}
                  name="recurringInterval"
                  className="w-full appearance-none rounded-xl border-none bg-white px-4 py-3 text-sm font-semibold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
                >
                  <option value="monthly">{t("newEntry.txFrequencyMonthly")}</option>
                  <option value="yearly">{t("newEntry.txFrequencyYearly")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f8793]">{t("newEntry.txDayOfMonth")}</label>
                <input
                  value={formik.values.recurringDayOfMonth}
                  onChange={(event) => {
                    formik.setFieldValue("recurringDayOfMonth", event.target.value.replace(/[^0-9]/g, "").slice(0, 2));
                  }}
                  onBlur={() => formik.setFieldTouched("recurringDayOfMonth", true)}
                  inputMode="numeric"
                  placeholder="5"
                  className="w-full rounded-xl border-none bg-white px-4 py-3 text-sm font-semibold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
                />
                {formik.touched.recurringDayOfMonth && formik.errors.recurringDayOfMonth ? (
                  <p className="text-xs text-[#a73b21]">{formik.errors.recurringDayOfMonth}</p>
                ) : null}
                <p className="text-xs text-[#6f8793]">{t("newEntry.txDayOfMonthHelp")}</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-[0.16em] text-[#6f8793]">{t("newEntry.txEndDate")}</label>
                <DatePicker
                  selected={formik.values.recurringEndDate}
                  onChange={(date: Date | null) => {
                    formik.setFieldValue("recurringEndDate", date);
                    formik.setFieldTouched("recurringEndDate", true, false);
                  }}
                  dateFormat="yyyy-MM-dd"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  minDate={formik.values.date ?? undefined}
                  isClearable
                  placeholderText={t("newEntry.txNoEndDate")}
                  wrapperClassName="w-full"
                  className="w-full rounded-xl border-none bg-white px-4 py-3 text-sm font-semibold text-[#1b3641] placeholder:text-[#8ea6b3] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
                  calendarClassName="ledger-datepicker"
                />
                {formik.touched.recurringEndDate && formik.errors.recurringEndDate ? (
                  <p className="text-xs text-[#a73b21]">{formik.errors.recurringEndDate}</p>
                ) : null}
                <p className="text-xs text-[#6f8793]">{t("newEntry.txEndDateHelp")}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          <label className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">
            {t("newEntry.txDescription")} <span className="text-[#a73b21]">*</span>
          </label>
          <input
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder={t("newEntry.txDescriptionPlaceholder")}
            className="w-full rounded-xl border-none bg-[#e7f6ff] px-6 py-4 text-[#1b3641] placeholder:text-[#7f97a4] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
          />
          {formik.touched.description && formik.errors.description ? (
            <p className="text-sm text-[#a73b21]">{formik.errors.description}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {formik.values.type === "expense" ? (
            <div className="space-y-3">
              <label className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">{t("newEntry.txCategory")}</label>
              <div className="relative">
                <select
                  name="categoryId"
                  value={formik.values.categoryId}
                  onChange={formik.handleChange}
                  className="w-full appearance-none rounded-xl border-none bg-[#e7f6ff] px-6 py-4 text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
                >
                  <option value="">{t("newEntry.txNoCategory")}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7f97a4]">
                  expand_more
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">
                {t("newEntry.txWallet")} <span className="text-[#a73b21]">*</span>
              </label>
              <div className="relative">
                <select
                  name="walletId"
                  value={formik.values.walletId}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full appearance-none rounded-xl border-none bg-[#e7f6ff] px-6 py-4 text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
                >
                  <option value="">Select wallet</option>
                  {(Array.isArray(wallets) ? wallets : []).map((wallet) => (
                    <option key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#7f97a4]">
                  expand_more
                </span>
              </div>
              {formik.touched.walletId && formik.errors.walletId ? (
                <p className="text-sm text-[#a73b21]">{formik.errors.walletId}</p>
              ) : null}
            </div>
          )}

          <div className="space-y-3">
            <label className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">
              {t("newEntry.txDate")} <span className="text-[#a73b21]">*</span>
            </label>
            <div className="relative">
              <DatePicker
                selected={formik.values.date}
                onChange={(date: Date | null) => {
                  formik.setFieldValue("date", date);
                  formik.setFieldTouched("date", true, false);
                }}
                dateFormat="yyyy-MM-dd"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="w-full rounded-xl border-none bg-[#e7f6ff] px-6 py-4 text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
                calendarClassName="ledger-datepicker"
              />
            </div>
            {formik.touched.date && formik.errors.date ? (
              <p className="text-sm text-[#a73b21]">{formik.errors.date}</p>
            ) : null}
          </div>
        </div>

        {formik.values.type === "expense" ? (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
            {categoryOptions.map((category) => {
              const selected = formik.values.categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => formik.setFieldValue("categoryId", category.id)}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition ${
                    selected
                      ? "bg-[#91f78e]/45 text-[#005e17] ring-2 ring-[#006f1d]"
                      : "bg-[#e7f6ff] text-[#6f8793] hover:bg-[#dff0fa]"
                  }`}
                >
                  <span className="material-symbols-outlined mb-1 text-xl">{iconForCategory(category.name)}</span>
                  <span className="w-full truncate text-[10px] font-bold">{category.name}</span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="space-y-3">
          <label className="font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">
            {t("newEntry.txNotes")} <span className="ml-1 font-normal text-[#7f97a4]">({t("newEntry.txOptional")})</span>
          </label>
          <textarea
            name="note"
            value={formik.values.note}
            onChange={formik.handleChange}
            rows={3}
            placeholder={t("newEntry.txNotesPlaceholder")}
            className="w-full resize-none rounded-xl border-none bg-[#e7f6ff] px-6 py-4 text-[#1b3641] placeholder:text-[#7f97a4] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/20"
          />
        </div>
      </div>

      {error ? <p className="rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-3 text-sm text-[#a73b21]">{error}</p> : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={createTransactionMutation.isPending}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#006f1d] py-6 font-[var(--font-manrope)] text-lg font-bold text-[#eaffe2] shadow-[0_12px_40px_-10px_rgba(0,111,29,0.3)] transition hover:bg-[#006118] disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="material-symbols-outlined">check_circle</span>
          <span>{createTransactionMutation.isPending ? t("newEntry.txAdding") : t("newEntry.txAdd")}</span>
        </button>
        <p className="mt-4 text-center text-xs font-medium text-[#7f97a4]">
          Press <span className="rounded bg-[#d4ecf9] px-1.5 py-0.5 text-[10px]">CMD</span> +{" "}
          <span className="rounded bg-[#d4ecf9] px-1.5 py-0.5 text-[10px]">Enter</span> to save quickly.
        </p>
      </div>
    </form>
  );
}
