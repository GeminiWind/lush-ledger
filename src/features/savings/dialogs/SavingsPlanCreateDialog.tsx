"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { addMonthsDate, fromISODate, isValidISODate, localeDateLabel, nowDate, startOfMonthDate, toISODate } from "@/lib/date";
import { formatCurrency, formatCurrencyInput, getCurrencyInputSuggestions, parseCurrencyInput } from "@/lib/format";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { useUserSetting } from "@/features/settings/hooks/useUserSetting";
import type { SavingsPlanCreateDialogProps } from "@/features/savings/types";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const savingsPlanIconChoices = ["home", "directions_car", "flight", "shield", "savings"] as const;

const monthLabel = (language: string, value: Date, fallback: string) => {
  if (!value) {
    return fallback;
  }

  return localeDateLabel(value, language === "vi-VN" ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  });
};

const toDateInputValue = (value: Date) => toISODate(value);

const getProjectedArrivalDate = (target: number, monthly: number, from = nowDate()) => {
  if (!Number.isFinite(target) || !Number.isFinite(monthly) || target <= 0 || monthly <= 0) {
    return null;
  }

  const months = Math.ceil(target / monthly);
  if (!Number.isFinite(months) || months <= 0) {
    return null;
  }

  return startOfMonthDate(addMonthsDate(from, months));
};

export default function SavingsPlanCreateDialog({ variant = "button" }: SavingsPlanCreateDialogProps) {
  const router = useRouter();
  const { language, currency } = useUserSetting();
  const t = useNamespacedTranslation("savings", language);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<(typeof savingsPlanIconChoices)[number]>("home");
  const [isPrimary, setIsPrimary] = useState(true);
  const queryClient = useQueryClient();

  const now = nowDate();
  const minDate = startOfMonthDate(now);

  const createPlanMutation = useMutation({
    mutationFn: async (values: { name: string; targetAmount: string; monthlyContribution: string; targetDate: string }) => {
      const response = await fetch("/api/savings/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          targetAmount: parseCurrencyInput(values.targetAmount),
          monthlyContribution: parseCurrencyInput(values.monthlyContribution),
          targetDate: values.targetDate,
          isPrimary,
          icon: selectedIcon,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t("savings.savingsPlanCreateFailed"));
      }

      return response.json() as Promise<{ plan?: { id?: string } }>;
    },
    onSuccess: async (payload) => {
      formik.resetForm({
        values: {
          name: "",
          targetAmount: "",
          monthlyContribution: "",
          targetDate: "",
        },
      });
      setSelectedIcon("home");
      setIsPrimary(true);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["savings"] });
      const planId = payload?.plan?.id;
      router.push(planId ? `/app/savings?filter=active&plan=${planId}` : "/app/savings?filter=active");
      toast.success(t("savings.savingsPlanCreateSuccess"));
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t("savings.savingsPlanCreateFailed"));
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      targetAmount: "",
      monthlyContribution: "",
      targetDate: "",
    },
    validate: (values) => {
      const errors: {
        name?: string;
        targetAmount?: string;
        monthlyContribution?: string;
        targetDate?: string;
      } = {};

      if (!values.name.trim()) {
        errors.name = t("savings.savingsPlanNameRequired");
      }

      const targetAmount = parseCurrencyInput(values.targetAmount);
      if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        errors.targetAmount = t("savings.savingsPlanTargetRequired");
      }

      const monthlyContribution = parseCurrencyInput(values.monthlyContribution);
      if (!Number.isFinite(monthlyContribution) || monthlyContribution <= 0) {
        errors.monthlyContribution = t("savings.savingsPlanMonthlyRequired");
      }

      if (!values.targetDate) {
        errors.targetDate = t("savings.savingsPlanDateRequired");
      } else {
        const date = fromISODate(values.targetDate);
        if (!date || !isValidISODate(values.targetDate)) {
          errors.targetDate = t("savings.savingsPlanDateInvalid");
        } else if (date < minDate) {
          errors.targetDate = t("savings.savingsPlanDateMin");
        }
      }

      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      createPlanMutation.mutate(values);
    },
  });

  const { values, setFieldValue } = formik;

  useEffect(() => {
    const target = parseCurrencyInput(values.targetAmount);
    const monthly = parseCurrencyInput(values.monthlyContribution);
    const arrival = getProjectedArrivalDate(target, monthly);
    const nextValue = arrival ? toDateInputValue(arrival) : "";

    if (values.targetDate !== nextValue) {
      setFieldValue("targetDate", nextValue, false);
    }
  }, [setFieldValue, values.monthlyContribution, values.targetAmount, values.targetDate]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setError(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const projection = useMemo(() => {
    const target = parseCurrencyInput(formik.values.targetAmount);
    const monthly = parseCurrencyInput(formik.values.monthlyContribution);
    const arrivalDate = getProjectedArrivalDate(target, monthly);
    const months = arrivalDate ? Math.ceil(target / monthly) : 0;

    return {
      months,
      target,
      monthly,
      arrivalText: arrivalDate ? monthLabel(language, arrivalDate, t("savings.savingsPlanNotAvailable")) : t("savings.savingsPlanNotAvailable"),
    };
  }, [formik.values.monthlyContribution, formik.values.targetAmount, language, t]);

  const targetAmountSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.targetAmount, currency);
  }, [currency, formik.values.targetAmount]);

  const monthlyContributionSuggestions = useMemo(() => {
    return getCurrencyInputSuggestions(formik.values.monthlyContribution, currency);
  }, [currency, formik.values.monthlyContribution]);

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setError(null);
            setSelectedIcon("home");
            setIsPrimary(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#006f1d] to-[#006118] px-6 py-3 text-sm font-bold text-[#eaffe2] shadow-[0_20px_30px_-20px_rgba(0,111,29,0.75)] hover:brightness-105"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>{t("savings.savingsPlanCreateAction")}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setError(null);
            setSelectedIcon("home");
            setIsPrimary(true);
          }}
          className="flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#c7dce9] bg-white/70 p-8 text-center transition-all hover:bg-[#006f1d]/5"
        >
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-[#9bb6c4]">
            <span className="material-symbols-outlined text-3xl text-[#647e8c]">add</span>
          </div>
          <p className="font-[var(--font-manrope)] text-base font-bold text-[#49636f]">{t("savings.savingsEnvisionGoal")}</p>
          <p className="mt-1 text-xs text-[#647e8c]">{t("savings.savingsAddToAtelier")}</p>
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(244,250,255,0.45)] p-4 backdrop-blur-[12px]"
          onMouseDown={() => {
            setOpen(false);
            setError(null);
          }}
        >
          <div
            className="mx-auto mt-6 w-full max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/30 bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#d4ecf9] bg-white/70 px-8 py-6 backdrop-blur-sm md:px-10 md:py-8">
              <div>
                <h2 className="font-[var(--font-manrope)] text-2xl font-extrabold tracking-tight text-[#1b3641] md:text-3xl">
                  {t("savings.savingsPlanAddNewTitle")}
                </h2>
                <p className="mt-1 max-w-2xl text-sm font-medium text-[#49636f]">
                  {t("savings.savingsPlanSubtitle")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                className="grid h-10 w-10 place-items-center rounded-full text-[#49636f] transition hover:bg-[#d4ecf9]"
                aria-label={t("savings.savingsPlanCloseAria")}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={formik.handleSubmit}>
              <div className="grid max-h-[75vh] grid-cols-1 gap-8 overflow-y-auto p-8 md:p-10 lg:grid-cols-12 lg:gap-10">
                <section className="space-y-6 lg:col-span-7">
                  <h3 className="flex items-center gap-2 font-[var(--font-manrope)] text-lg font-bold text-[#1b3641]">
                    <span className="h-6 w-1.5 rounded-full bg-[#006f1d]" />
                  {t("savings.savingsPlanBlueprintTitle")}
                  </h3>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                      {t("savings.savingsPlanNameLabel")} <span className="text-[#a73b21]">*</span>
                    </label>
                    <input
                      name="name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t("savings.savingsPlanNamePlaceholder")}
                      className="w-full rounded-2xl border-none bg-[#e7f6ff] p-4 text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                    />
                    {formik.touched.name && formik.errors.name ? <p className="text-xs text-[#a73b21]">{formik.errors.name}</p> : null}
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                        {t("savings.savingsPlanTargetLabel")} <span className="text-[#a73b21]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          name="targetAmount"
                          value={formik.values.targetAmount}
                          onChange={(event) => {
                            formik.setFieldValue("targetAmount", formatCurrencyInput(event.target.value, currency));
                          }}
                          onBlur={formik.handleBlur}
                          inputMode="numeric"
                          placeholder={t("savings.savingsPlanTargetPlaceholder")}
                          className="w-full rounded-2xl border-none bg-[#e7f6ff] p-4 pr-16 font-[var(--font-manrope)] font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#006f1d]">
                          {currency}
                        </span>
                      </div>
                      {targetAmountSuggestions.length ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {targetAmountSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.value}
                              type="button"
                              onClick={() => formik.setFieldValue("targetAmount", formatCurrencyInput(String(suggestion.value), currency))}
                              className="rounded-full border border-[#cce4ef] bg-[#f5fcff] px-3 py-1 text-xs font-bold text-[#1b3641] transition hover:border-[#8dc4da] hover:bg-[#ebf8ff]"
                            >
                              {suggestion.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {formik.touched.targetAmount && formik.errors.targetAmount ? (
                        <p className="text-xs text-[#a73b21]">{formik.errors.targetAmount}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                        {t("savings.savingsPlanMonthlyLabel")} <span className="text-[#a73b21]">*</span>
                      </label>
                      <div className="relative">
                        <input
                          name="monthlyContribution"
                          value={formik.values.monthlyContribution}
                          onChange={(event) => {
                            formik.setFieldValue("monthlyContribution", formatCurrencyInput(event.target.value, currency));
                          }}
                          onBlur={formik.handleBlur}
                          inputMode="numeric"
                          placeholder={t("savings.savingsPlanMonthlyPlaceholder")}
                          className="w-full rounded-2xl border-none bg-[#e7f6ff] p-4 pr-16 font-[var(--font-manrope)] font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                        />
                        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#006f1d]">
                          {currency}
                        </span>
                      </div>
                      {monthlyContributionSuggestions.length ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {monthlyContributionSuggestions.map((suggestion) => (
                            <button
                              key={suggestion.value}
                              type="button"
                              onClick={() => formik.setFieldValue("monthlyContribution", formatCurrencyInput(String(suggestion.value), currency))}
                              className="rounded-full border border-[#cce4ef] bg-[#f5fcff] px-3 py-1 text-xs font-bold text-[#1b3641] transition hover:border-[#8dc4da] hover:bg-[#ebf8ff]"
                            >
                              {suggestion.label}
                            </button>
                          ))}
                        </div>
                      ) : null}
                      {formik.touched.monthlyContribution && formik.errors.monthlyContribution ? (
                        <p className="text-xs text-[#a73b21]">{formik.errors.monthlyContribution}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                      {t("savings.savingsPlanArrivalDateLabel")} <span className="text-[#a73b21]">*</span>
                    </label>
                    <input
                      name="targetDate"
                      type="date"
                      min={toDateInputValue(minDate)}
                      value={formik.values.targetDate}
                      readOnly
                      onBlur={formik.handleBlur}
                      className="w-full rounded-2xl border-none bg-[#e7f6ff] p-4 text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                    />
                    <p className="text-[11px] text-[#647e8c]">
                      {t("savings.savingsPlanArrivalHint")}
                    </p>
                    {formik.touched.targetDate && formik.errors.targetDate ? (
                      <p className="text-xs text-[#a73b21]">{formik.errors.targetDate}</p>
                    ) : null}
                  </div>

                  <div className="space-y-3 rounded-2xl bg-[#eef8ff] p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t("savings.savingsPlanIsPrimaryLabel")}</label>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPrimary}
                        onClick={() => setIsPrimary((value) => !value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${isPrimary ? "bg-[#006f1d]" : "bg-[#9bb6c4]"}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-[#eaffe2] transition ${isPrimary ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#647e8c]">{t("savings.savingsPlanIsPrimaryHint")}</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">{t("savings.savingsPlanIdentityLabel")}</label>
                    <div className="flex flex-wrap gap-3 rounded-2xl bg-[#eef8ff] p-4">
                      {savingsPlanIconChoices.map((icon) => {
                        const selected = selectedIcon === icon;
                        return (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => setSelectedIcon(icon)}
                            className={`grid h-12 w-12 place-items-center rounded-xl transition ${
                              selected ? "bg-[#006f1d] text-[#eaffe2] shadow-[0_8px_20px_-10px_rgba(0,111,29,0.6)]" : "bg-white text-[#49636f] hover:bg-[#dff1fb]"
                            }`}
                            aria-label={t("savings.savingsPlanIdentitySelectTemplate").replace("{icon}", icon)}
                            title={icon}
                          >
                            <span className="material-symbols-outlined text-xl">{icon}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {error ? <div className="rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-2 text-sm text-[#a73b21]">{error}</div> : null}
                </section>

                <section className="space-y-6 lg:col-span-5">
                  <article className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#006f1d_0%,#006118_100%)] p-8 text-[#eaffe2] shadow-xl">
                    <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl transition-all duration-700" />
                    <h3 className="relative z-10 text-lg font-bold opacity-90">
                      {t("savings.savingsPlanProjectionPreview")}
                    </h3>

                    <div className="relative z-10 mt-8 flex flex-col items-center space-y-5 text-center">
                      <div className="relative grid h-28 w-28 place-items-center rounded-full border-8 border-[#83e881]/30">
                        <span className="font-[var(--font-manrope)] text-3xl font-extrabold">{projection.months || 0}</span>
                      </div>

                      <div>
                        <p className="font-[var(--font-manrope)] text-xl font-bold">{t("savings.savingsPlanEstimatedMonths")}</p>
                        <p className="mt-1 text-xs text-[#d8ffe0]">
                          {t("savings.savingsPlanToReachTarget")}: {formatCurrency(projection.target, currency)}
                        </p>
                      </div>

                      <div className="w-full space-y-3 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em]">
                        <div className="flex items-center justify-between text-[#d8ffe0]">
                          <span>{t("savings.savingsPlanArrival")}</span>
                          <span className="text-[#eaffe2]">{projection.arrivalText}</span>
                        </div>
                        <div className="h-px w-full bg-white/10" />
                        <div className="flex items-center justify-between text-[#d8ffe0]">
                          <span>{t("savings.savingsPlanMonthly")}</span>
                          <span className="text-[#eaffe2]">{formatCurrency(projection.monthly, currency)}</span>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[2rem] bg-[#d4ecf9] p-6">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#006f1d] shadow-sm">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>lightbulb</span>
                      </div>
                      <p className="text-sm leading-relaxed text-[#40555f]">
                        {t("savings.savingsPlanTip")}
                      </p>
                    </div>
                  </article>
                </section>
              </div>

              <div className="flex items-center justify-end gap-4 border-t border-[#d4ecf9] bg-white px-8 py-6 md:px-10 md:py-8">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError(null);
                  }}
                  className="rounded-full px-6 py-3 text-sm font-bold text-[#49636f] transition hover:bg-[#d4ecf9]"
                >
                  {t("savings.savingsPlanDiscard")}
                </button>
                <button
                  type="submit"
                  disabled={createPlanMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#006f1d] to-[#006118] px-8 py-3 text-sm font-bold text-[#eaffe2] shadow-[0_20px_30px_-20px_rgba(0,111,29,0.75)] transition hover:brightness-105 disabled:opacity-70"
                >
                  <span>{createPlanMutation.isPending ? t("savings.savingsPlanCreating") : t("savings.savingsPlanCreateAction")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
