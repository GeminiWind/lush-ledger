"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { tr } from "@/lib/i18n";

type Props = {
  language: string;
  currency: string;
  variant?: "button" | "card";
};

const toPlainNumber = (value: string) => {
  const normalized = value.replace(/[^\d]/g, "");
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

const monthLabel = (language: string, value: Date) => {
  if (Number.isNaN(value.getTime())) {
    return tr(language, "Not available", "Chưa có");
  }

  return new Intl.DateTimeFormat(language === "vi-VN" ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(value);
};

const toDateInputValue = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

const getProjectedArrivalDate = (target: number, monthly: number, from = new Date()) => {
  if (!Number.isFinite(target) || !Number.isFinite(monthly) || target <= 0 || monthly <= 0) {
    return null;
  }

  const months = Math.ceil(target / monthly);
  if (!Number.isFinite(months) || months <= 0) {
    return null;
  }

  const projected = new Date(from.getFullYear(), from.getMonth() + months, 1);
  return Number.isNaN(projected.getTime()) ? null : projected;
};

export default function SavingsPlanCreateDialog({ language, currency, variant = "button" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const minDate = new Date(now.getFullYear(), now.getMonth(), 1);

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
        errors.name = tr(language, "Plan name is required.", "Tên kế hoạch là bắt buộc.");
      }

      const targetAmount = toPlainNumber(values.targetAmount);
      if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
        errors.targetAmount = tr(language, "Savings target must be greater than zero.", "Mục tiêu tiết kiệm phải lớn hơn 0.");
      }

      const monthlyContribution = toPlainNumber(values.monthlyContribution);
      if (!Number.isFinite(monthlyContribution) || monthlyContribution <= 0) {
        errors.monthlyContribution = tr(language, "Monthly contribution must be greater than zero.", "Mức đóng góp hằng tháng phải lớn hơn 0.");
      }

      if (!values.targetDate) {
        errors.targetDate = tr(language, "Target date is required.", "Ngày mục tiêu là bắt buộc.");
      } else {
        const date = new Date(values.targetDate);
        if (Number.isNaN(date.getTime())) {
          errors.targetDate = tr(language, "Target date is invalid.", "Ngày mục tiêu không hợp lệ.");
        } else if (date < minDate) {
          errors.targetDate = tr(language, "Target date must be this month or later.", "Ngày mục tiêu phải từ tháng này trở đi.");
        }
      }

      return errors;
    },
    onSubmit: async (values, helpers) => {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/savings/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          targetAmount: toPlainNumber(values.targetAmount),
          monthlyContribution: toPlainNumber(values.monthlyContribution),
          targetDate: values.targetDate,
        }),
      });

      setSubmitting(false);

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || tr(language, "Unable to create savings plan.", "Không thể tạo kế hoạch tiết kiệm."));
        return;
      }

      helpers.resetForm({
        values: {
          name: "",
          targetAmount: "",
          monthlyContribution: "",
          targetDate: "",
        },
      });
      setOpen(false);
      router.refresh();
    },
  });

  const { values, setFieldValue } = formik;

  useEffect(() => {
    const target = toPlainNumber(values.targetAmount);
    const monthly = toPlainNumber(values.monthlyContribution);
    const arrival = getProjectedArrivalDate(target, monthly);
    const nextValue = arrival ? toDateInputValue(arrival) : "";

    if (values.targetDate !== nextValue) {
      setFieldValue("targetDate", nextValue, false);
    }
  }, [setFieldValue, values.monthlyContribution, values.targetAmount, values.targetDate]);

  const projection = useMemo(() => {
    const target = toPlainNumber(formik.values.targetAmount);
    const monthly = toPlainNumber(formik.values.monthlyContribution);
    const arrivalDate = getProjectedArrivalDate(target, monthly);
    const months = arrivalDate ? Math.ceil(target / monthly) : 0;

    return {
      months,
      target,
      monthly,
      arrivalText: arrivalDate ? monthLabel(language, arrivalDate) : tr(language, "Not available", "Chưa có"),
    };
  }, [formik.values.monthlyContribution, formik.values.targetAmount, language]);

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setError(null);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#006f1d] to-[#006118] px-6 py-3 text-sm font-bold text-[#eaffe2] shadow-[0_20px_30px_-20px_rgba(0,111,29,0.75)] hover:brightness-105"
        >
          <span className="material-symbols-outlined text-lg">add</span>
          <span>{tr(language, "Create Savings Plan", "Tạo kế hoạch tiết kiệm")}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            setError(null);
          }}
          className="flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#c7dce9] bg-white/70 p-8 text-center transition-all hover:bg-[#006f1d]/5"
        >
          <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-[#9bb6c4]">
            <span className="material-symbols-outlined text-3xl text-[#647e8c]">add</span>
          </div>
          <p className="font-[var(--font-manrope)] text-base font-bold text-[#49636f]">{tr(language, "Envision New Goal", "Thêm mục tiêu mới")}</p>
          <p className="mt-1 text-xs text-[#647e8c]">{tr(language, "Add to your fiscal atelier", "Bổ sung vào không gian tài chính")}</p>
        </button>
      )}

      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="mx-auto mt-6 w-full max-w-6xl rounded-[2rem] bg-[#f4faff] p-8 shadow-2xl md:p-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-[var(--font-manrope)] text-3xl font-extrabold tracking-tight text-[#1b3641]">
                  {tr(language, "Add New Savings Plan", "Thêm kế hoạch tiết kiệm")}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-[#49636f]">
                  {tr(
                    language,
                    "Design a focused savings vessel for your next milestone.",
                    "Thiết kế một kế hoạch tiết kiệm tập trung cho cột mốc tiếp theo.",
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#49636f] hover:bg-[#dcf1fd]"
                aria-label={tr(language, "Close", "Đóng")}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <section className="space-y-6 rounded-3xl bg-white p-8 shadow-sm lg:col-span-7">
                <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">
                  {tr(language, "The Blueprint", "Bản thiết kế")}
                </h3>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                    {tr(language, "Plan Name", "Tên kế hoạch")} <span className="text-[#a73b21]">*</span>
                  </label>
                  <input
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={tr(language, "e.g., Kyoto Sanctuary Fund", "Ví dụ: Quỹ nhà mơ ước")}
                    className="w-full rounded-2xl border-none bg-[#e7f6ff] p-4 text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                  />
                  {formik.touched.name && formik.errors.name ? <p className="text-xs text-[#a73b21]">{formik.errors.name}</p> : null}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                      {tr(language, "Savings Target", "Mục tiêu tiết kiệm")} <span className="text-[#a73b21]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="targetAmount"
                        value={formik.values.targetAmount}
                        onChange={(event) => {
                          formik.setFieldValue("targetAmount", event.target.value.replace(/[^\d]/g, ""));
                        }}
                        onBlur={formik.handleBlur}
                        inputMode="numeric"
                        placeholder={tr(language, "500000000", "500000000")}
                        className="w-full rounded-2xl border-none bg-[#e7f6ff] p-4 pr-16 font-[var(--font-manrope)] font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#006f1d]">
                        {currency}
                      </span>
                    </div>
                    {formik.touched.targetAmount && formik.errors.targetAmount ? (
                      <p className="text-xs text-[#a73b21]">{formik.errors.targetAmount}</p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                      {tr(language, "Monthly Contribution", "Đóng góp hằng tháng")} <span className="text-[#a73b21]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        name="monthlyContribution"
                        value={formik.values.monthlyContribution}
                        onChange={(event) => {
                          formik.setFieldValue("monthlyContribution", event.target.value.replace(/[^\d]/g, ""));
                        }}
                        onBlur={formik.handleBlur}
                        inputMode="numeric"
                        placeholder={tr(language, "15000000", "15000000")}
                        className="w-full rounded-2xl border-none bg-[#e7f6ff] p-4 pr-16 font-[var(--font-manrope)] font-bold text-[#1b3641] outline-none ring-2 ring-transparent transition focus:ring-[#006f1d]/25"
                      />
                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[#006f1d]">
                        {currency}
                      </span>
                    </div>
                    {formik.touched.monthlyContribution && formik.errors.monthlyContribution ? (
                      <p className="text-xs text-[#a73b21]">{formik.errors.monthlyContribution}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#647e8c]">
                    {tr(language, "Arrival Date", "Ngày về đích")}
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
                    {tr(
                      language,
                      "Auto-calculated from savings target and monthly contribution.",
                      "Tự động tính từ mục tiêu tiết kiệm và mức đóng góp hằng tháng.",
                    )}
                  </p>
                  {formik.touched.targetDate && formik.errors.targetDate ? (
                    <p className="text-xs text-[#a73b21]">{formik.errors.targetDate}</p>
                  ) : null}
                </div>

                {error ? <div className="rounded-xl border border-[#f8cfc4] bg-[#fff3ef] px-4 py-2 text-sm text-[#a73b21]">{error}</div> : null}

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-5 py-2 text-sm font-semibold text-[#006f1d] hover:bg-[#dff3ea]"
                  >
                    {tr(language, "Discard", "Hủy")}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#006f1d] to-[#006118] px-6 py-3 text-sm font-bold text-[#eaffe2] shadow-[0_20px_30px_-20px_rgba(0,111,29,0.75)] hover:brightness-105 disabled:opacity-70"
                  >
                    <span>{submitting ? tr(language, "Creating...", "Đang tạo...") : tr(language, "Create Savings Plan", "Tạo kế hoạch")}</span>
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </section>

              <section className="space-y-6 lg:col-span-5">
                <article className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#006f1d_0%,#006118_100%)] p-8 text-[#eaffe2] shadow-xl">
                  <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
                  <h3 className="relative z-10 font-[var(--font-manrope)] text-xl font-bold">
                    {tr(language, "Projection Preview", "Dự báo tiến độ")}
                  </h3>

                  <div className="relative z-10 mt-8 space-y-6">
                    <div className="grid h-28 w-28 place-items-center rounded-full border-4 border-[#91f78e]/40">
                      <span className="font-[var(--font-manrope)] text-4xl font-extrabold">{projection.months || 0}</span>
                    </div>

                    <div>
                      <p className="font-[var(--font-manrope)] text-xl font-bold">{tr(language, "Estimated Months", "Số tháng dự kiến")}</p>
                      <p className="text-sm text-[#d8ffe0]">
                        {tr(language, "To reach your target", "Để đạt mục tiêu của bạn")}: {asCurrency(projection.target, currency)}
                      </p>
                    </div>

                    <div className="space-y-3 border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-[0.14em]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#d8ffe0]">{tr(language, "Arrival", "Về đích")}</span>
                        <span>{projection.arrivalText}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#d8ffe0]">{tr(language, "Monthly", "Theo tháng")}</span>
                        <span>{asCurrency(projection.monthly, currency)}</span>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-3xl bg-[#d4ecf9] p-6">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#006f1d] shadow-sm">
                      <span className="material-symbols-outlined">lightbulb</span>
                    </div>
                    <p className="text-sm leading-relaxed text-[#40555f]">
                      {tr(
                        language,
                        "Tip: increase monthly contribution to shorten your timeline.",
                        "Gợi ý: tăng đóng góp hằng tháng để rút ngắn thời gian đạt mục tiêu.",
                      )}
                    </p>
                  </div>
                </article>
              </section>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
