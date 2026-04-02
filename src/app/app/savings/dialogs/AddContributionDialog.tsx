"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { isValidISODate, nowDate, toISODate } from "@/lib/date";
import toast from "react-hot-toast";
import { formatCurrencyInput, parseCurrencyInput } from "@/lib/format";
import { getDictionary } from "@/lib/i18n";
import { useUserSetting } from "@/hooks/useUserSetting";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type PlanOption = {
  id: string;
  name: string;
  progress: number;
};

type WalletOption = {
  id: string;
  name: string;
};

type Props = {
  plans: PlanOption[];
  wallets: WalletOption[];
  defaultPlanId?: string;
};

const toDateInputValue = (value: Date) => toISODate(value);

const buildDateTimeWithCurrentTime = (dateValue: string) => {
  const selectedDate = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(selectedDate.getTime())) {
    return dateValue;
  }

  const now = nowDate();
  selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
  return selectedDate.toISOString();
};

export default function AddContributionDialog({ plans, wallets, defaultPlanId }: Props) {
  const router = useRouter();
  const { language, currency } = useUserSetting();
  const t = getDictionary(language);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const initialPlanId = defaultPlanId || plans[0]?.id || "";
  const initialWalletId = wallets[0]?.id || "";

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

  const addContributionMutation = useMutation({
    mutationFn: async (values: { savingsPlanId: string; walletId: string; amountDisplay: string; date: string }) => {
      const selectedPlan = plans.find((plan) => plan.id === values.savingsPlanId);
      const contributionLabel = selectedPlan
        ? t.savingsContributionNoteTemplate.replace("{plan}", selectedPlan.name)
        : t.savingsContributionNoteFallback;

      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: values.walletId,
          type: "transfer_to_saving_plan",
          amount: parseCurrencyInput(values.amountDisplay),
          date: buildDateTimeWithCurrentTime(values.date),
          savingsPlanId: values.savingsPlanId,
          notes: contributionLabel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.savingsContributionFailed);
      }
    },
    onSuccess: async () => {
      formik.resetForm();
      toast.success(t.savingsContributionSuccess);
      setOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["savings"] });
      router.refresh();
    },
    onError: (mutationError: unknown) => {
      setError(mutationError instanceof Error ? mutationError.message : t.savingsContributionFailed);
    },
  });

  const formik = useFormik({
    initialValues: {
      savingsPlanId: initialPlanId,
      walletId: initialWalletId,
      amountDisplay: "",
      date: toDateInputValue(nowDate()),
    },
    validate: (values) => {
      const errors: {
        savingsPlanId?: string;
        walletId?: string;
        amountDisplay?: string;
        date?: string;
      } = {};

      const amount = parseCurrencyInput(values.amountDisplay);
      if (!values.savingsPlanId) {
        errors.savingsPlanId = t.savingsContributionPlanRequired;
      }
      if (!values.walletId) {
        errors.walletId = t.savingsContributionWalletRequired;
      }
      if (!Number.isFinite(amount) || amount <= 0) {
        errors.amountDisplay = t.savingsContributionAmountRequired;
      }
      if (!values.date || !isValidISODate(values.date)) {
        errors.date = t.savingsContributionDateRequired;
      }

      return errors;
    },
    onSubmit: async (values) => {
      setError(null);
      addContributionMutation.mutate(values);
    },
  });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-[#006f1d] px-5 py-3 text-sm font-bold text-[#eaffe2] shadow-[0_16px_30px_-18px_rgba(0,111,29,0.8)] hover:brightness-105"
      >
        <span className="material-symbols-outlined text-[18px]">payments</span>
        {t.savingsAddContribution}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1b3641]/10 p-4 backdrop-blur-sm"
          onMouseDown={() => {
            setOpen(false);
            setError(null);
          }}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-[#cbe7f6]/50 bg-[#f4faff]/90 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="px-10 pb-6 pt-10">
              <div className="mb-2 flex items-start justify-between">
                <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-tight text-[#1b3641]">
                  {t.savingsContributionTitle}
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-full text-[#49636f] hover:bg-[#d4ecf9]"
                  aria-label={t.savingsPlanCloseAria}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-sm leading-relaxed text-[#49636f]">{t.savingsContributionSubtitle}</p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-8 px-10 pb-10">
              <div className="space-y-3">
                <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                  {t.savingsContributionTargetLabel} <span className="text-[#a73b21]">*</span>
                </label>
                <div className="relative">
                  <select
                    name="savingsPlanId"
                    value={formik.values.savingsPlanId}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full appearance-none rounded-xl border-none bg-[#e7f6ff] px-5 py-4 font-semibold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/30"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({Math.round(plan.progress)}% {t.savingsCompleteBadge})
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#647e8c]">
                    expand_more
                  </span>
                </div>
                {formik.touched.savingsPlanId && formik.errors.savingsPlanId ? (
                  <p className="text-xs text-[#a73b21]">{formik.errors.savingsPlanId}</p>
                ) : null}
              </div>

              <div className="space-y-3">
                <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                  {t.savingsContributionAmountLabel} <span className="text-[#a73b21]">*</span>
                </label>
                <div className="relative">
                  <input
                    name="amountDisplay"
                    value={formik.values.amountDisplay}
                    onChange={(event) => formik.setFieldValue("amountDisplay", formatCurrencyInput(event.target.value, currency))}
                    onBlur={() => formik.setFieldTouched("amountDisplay", true)}
                    placeholder="0"
                    inputMode="numeric"
                    className="w-full rounded-xl border-none bg-[#e7f6ff] py-5 pl-12 pr-16 font-[var(--font-manrope)] text-3xl font-extrabold text-[#1b3641] placeholder:text-[#9bb6c4] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/30"
                  />
                  <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-bold text-[#006f1d]">
                    {currency === "VND" ? "₫" : currency}
                  </span>
                  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-[#91f78e] px-2 py-0.5 text-[10px] font-bold text-[#005e17]">
                    {currency}
                  </span>
                </div>
                {formik.touched.amountDisplay && formik.errors.amountDisplay ? (
                  <p className="text-xs text-[#a73b21]">{formik.errors.amountDisplay}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                    {t.savingsContributionDateLabel} <span className="text-[#a73b21]">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formik.values.date}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full rounded-xl border-none bg-[#e7f6ff] px-5 py-4 font-medium text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/30"
                  />
                  {formik.touched.date && formik.errors.date ? <p className="text-xs text-[#a73b21]">{formik.errors.date}</p> : null}
                </div>

                <div className="space-y-3">
                  <label className="block px-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#49636f]">
                    {t.savingsContributionWalletLabel} <span className="text-[#a73b21]">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="walletId"
                      value={formik.values.walletId}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="w-full appearance-none rounded-xl border-none bg-[#e7f6ff] px-5 py-4 font-semibold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/30"
                    >
                      {wallets.map((wallet) => (
                        <option key={wallet.id} value={wallet.id}>
                          {wallet.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#647e8c]">
                      expand_more
                    </span>
                  </div>
                  {formik.touched.walletId && formik.errors.walletId ? <p className="text-xs text-[#a73b21]">{formik.errors.walletId}</p> : null}
                </div>
              </div>

              {error ? <p className="rounded-lg bg-[#fd795a]/15 px-4 py-3 text-sm text-[#791903]">{error}</p> : null}

              <div className="flex items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={addContributionMutation.isPending}
                  className="flex-1 rounded-xl bg-gradient-to-br from-[#006f1d] to-[#006118] py-4 font-[var(--font-manrope)] text-lg font-bold text-[#eaffe2] shadow-[0_14px_30px_-18px_rgba(0,111,29,0.8)] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addContributionMutation.isPending ? t.savingsContributionSubmitting : t.savingsContributionConfirm}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-8 py-4 font-[var(--font-manrope)] font-bold text-[#647e8c] hover:bg-[#d4ecf9]"
                >
                  {t.savingsPlanDiscard}
                </button>
              </div>
            </form>

            <div className="flex items-center justify-between bg-[#91f78e]/25 px-10 py-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-[#005e17]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  security
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#005e17]">{t.savingsContributionSecurity}</span>
              </div>
              <span className="text-[10px] text-[#49636f]">{t.savingsContributionSecurityNote}</span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
