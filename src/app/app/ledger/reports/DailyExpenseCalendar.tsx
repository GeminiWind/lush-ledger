"use client";

import { useRef } from "react";
import { useEffect, useMemo, useState } from "react";
import { tr } from "@/lib/i18n";

type CalendarEntry = {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
};

type CalendarDay = {
  key: string;
  day: number;
  inMonth: boolean;
  total: number;
  level: number;
  entries: CalendarEntry[];
};

type Props = {
  currency: string;
  monthLabel: string;
  selectedMonth: number;
  selectedYear: number;
  yearOptions: number[];
  language: string;
  days: CalendarDay[];
};

const asCurrency = (value: number, currency: string) => {
  const locale = currency === "VND" ? "vi-VN" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

export default function DailyExpenseCalendar({
  currency,
  monthLabel,
  selectedMonth,
  selectedYear,
  yearOptions,
  language,
  days,
}: Props) {
  const weekdayLabels = [
    tr(language, "Mon", "T2"),
    tr(language, "Tue", "T3"),
    tr(language, "Wed", "T4"),
    tr(language, "Thu", "T5"),
    tr(language, "Fri", "T6"),
    tr(language, "Sat", "T7"),
    tr(language, "Sun", "CN"),
  ];

  const monthOptions = [
    { value: 1, label: tr(language, "January", "Tháng 1") },
    { value: 2, label: tr(language, "February", "Tháng 2") },
    { value: 3, label: tr(language, "March", "Tháng 3") },
    { value: 4, label: tr(language, "April", "Tháng 4") },
    { value: 5, label: tr(language, "May", "Tháng 5") },
    { value: 6, label: tr(language, "June", "Tháng 6") },
    { value: 7, label: tr(language, "July", "Tháng 7") },
    { value: 8, label: tr(language, "August", "Tháng 8") },
    { value: 9, label: tr(language, "September", "Tháng 9") },
    { value: 10, label: tr(language, "October", "Tháng 10") },
    { value: 11, label: tr(language, "November", "Tháng 11") },
    { value: 12, label: tr(language, "December", "Tháng 12") },
  ];
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedDay = useMemo(() => {
    if (!selectedKey) {
      return null;
    }
    return days.find((day) => day.key === selectedKey) || null;
  }, [days, selectedKey]);

  useEffect(() => {
    if (!selectedDay) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedKey(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedDay]);

  return (
    <>
      <section className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">{tr(language, "Daily Expense Calendar", "Lịch chi tiêu theo ngày")}</h3>
          <form ref={formRef} className="flex items-center gap-2" method="get">
            <div className="rounded-full border border-[#d7e5dc] bg-white px-3 py-2 text-sm font-semibold text-[#1b3641]">
              <select
                name="month"
                defaultValue={String(selectedMonth)}
                onChange={() => formRef.current?.requestSubmit()}
                className="border-none bg-transparent pr-2 text-sm font-semibold text-[#1b3641] focus:ring-0"
              >
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-full border border-[#d7e5dc] bg-white px-3 py-2 text-sm font-semibold text-[#1b3641]">
              <select
                name="year"
                defaultValue={String(selectedYear)}
                onChange={() => formRef.current?.requestSubmit()}
                className="border-none bg-transparent pr-2 text-sm font-semibold text-[#1b3641] focus:ring-0"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[#d8e8f3] bg-white shadow-[0_10px_30px_-20px_rgba(27,54,65,0.25)]">
          <div className="grid grid-cols-7 border-b border-[#e8f1f7]">
            {weekdayLabels.map((label) => (
              <div key={label} className="py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#7f97a4]">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              return (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => (day.entries.length ? setSelectedKey(day.key) : undefined)}
                  className={`min-h-[118px] border-b border-r border-[#edf4f8] p-3 text-left transition ${
                    day.inMonth ? "bg-white hover:bg-[#eef8f1]" : "bg-[#f6fbff] opacity-40"
                  } ${day.entries.length ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-semibold text-[#1b3641]">{day.day}</span>
                    {day.entries.length ? (
                      <span className="material-symbols-outlined text-sm text-[#89a9ba]">expand_more</span>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <p className={`text-[10px] font-bold ${day.total > 0 ? "text-[#006f1d]" : "text-[#9cb1bd]"}`}>
                      {day.total > 0 ? asCurrency(day.total, currency) : "-"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {selectedDay ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
          onMouseDown={() => setSelectedKey(null)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-3xl border border-[#d8e8f3] bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h4 className="font-[var(--font-manrope)] text-lg font-bold text-[#1b3641]">{tr(language, "Daily Details", "Chi tiết trong ngày")}</h4>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7f97a4]">{monthLabel}</p>
              </div>

              <div className="space-y-3">
                {selectedDay.entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border-b border-[#edf4f8] py-2">
                    <div>
                      <p className="text-xs font-bold text-[#1b3641]">{entry.title}</p>
                      <p className="text-[10px] text-[#6f8793]">{entry.subtitle}</p>
                    </div>
                    <span className="text-xs font-bold text-[#006f1d]">{asCurrency(entry.amount, currency)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-[#7f97a4]">{tr(language, "Total Spent", "Tổng đã chi")}</span>
                <span className="font-[var(--font-manrope)] text-sm font-extrabold text-[#006f1d]">
                  {asCurrency(selectedDay.total, currency)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSelectedKey(null)}
                className="w-full rounded-xl bg-[#e7f6ff] py-2.5 text-xs font-bold text-[#1b3641] transition hover:bg-[#d6ecf9]"
              >
                {tr(language, "Close View", "Đóng")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
