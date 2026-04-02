"use client";

import { useEffect, useMemo, useState } from "react";
import { asCurrency, ExpenseEntry, formatMonthLabel, parseMonthKey } from "./report-utils";

const selectClassName =
  "appearance-none rounded-full border border-[#c3d8e5] bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-[#1b3641]";

type Props = {
  language: string;
  currency: string;
  monthOptions: string[];
  expenseEntries: ExpenseEntry[];
  labels: {
    title: string;
    weekdays: string[];
    detailsTitle: string;
    totalSpent: string;
    closeView: string;
    noExpenseData: string;
    fallbackTransaction: string;
  };
};

export default function DailyCalendar({ language, currency, monthOptions, expenseEntries, labels }: Props) {
  const [calendarMonth, setCalendarMonth] = useState(monthOptions[monthOptions.length - 1] ?? "");
  const [activeDayISO, setActiveDayISO] = useState<string | null>(null);

  const calendarDayMap = useMemo(() => {
    return expenseEntries.reduce((map, entry) => {
      if (!entry.dateISO.startsWith(calendarMonth)) {
        return map;
      }

      const day = Number(entry.dateISO.slice(8, 10));
      const list = map.get(day) ?? [];
      list.push(entry);
      map.set(day, list);
      return map;
    }, new Map<number, ExpenseEntry[]>());
  }, [calendarMonth, expenseEntries]);

  const maxDailyExpense = useMemo(() => {
    let max = 0;
    for (const entries of calendarDayMap.values()) {
      const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
      max = Math.max(max, total);
    }
    return max;
  }, [calendarDayMap]);

  const calendarCells = useMemo(() => {
    const { year, month } = parseMonthKey(calendarMonth);
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
    const previousMonthDays = new Date(year, month - 1, 0).getDate();
    const cells: Array<{ day: number; isCurrentMonth: boolean; isoDate: string | null }> = [];

    for (let index = 0; index < totalCells; index += 1) {
      if (index < startOffset) {
        const day = previousMonthDays - (startOffset - index - 1);
        cells.push({ day, isCurrentMonth: false, isoDate: null });
        continue;
      }

      if (index >= startOffset + daysInMonth) {
        const day = index - startOffset - daysInMonth + 1;
        cells.push({ day, isCurrentMonth: false, isoDate: null });
        continue;
      }

      const day = index - startOffset + 1;
      const isoDate = `${calendarMonth}-${String(day).padStart(2, "0")}`;
      cells.push({ day, isCurrentMonth: true, isoDate });
    }

    return cells;
  }, [calendarMonth]);

  const activeDayEntries = useMemo(() => {
    if (!activeDayISO) {
      return [];
    }

    const day = Number(activeDayISO.slice(8, 10));
    return (calendarDayMap.get(day) ?? []).slice().sort((left, right) => left.dateISO.localeCompare(right.dateISO));
  }, [activeDayISO, calendarDayMap]);

  useEffect(() => {
    if (!activeDayISO) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDayISO(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeDayISO]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-[var(--font-manrope)] text-2xl font-extrabold tracking-tight text-[#1b3641]">{labels.title}</h2>
        <div>
          <label className="sr-only" htmlFor="calendar-month-select">{labels.title}</label>
          <div className="relative">
            <select
              id="calendar-month-select"
              value={calendarMonth}
              onChange={(event) => setCalendarMonth(event.target.value)}
              className={selectClassName}
            >
              {[...monthOptions].reverse().map((monthKeyValue) => (
                <option key={`calendar-${monthKeyValue}`} value={monthKeyValue}>
                  {formatMonthLabel(monthKeyValue, language, "long")}
                </option>
              ))}
            </select>
            <span className="pointer-events-none material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#6f8793]">
              expand_more
            </span>
          </div>
        </div>
      </div>

      <article className="overflow-hidden rounded-[2rem] border border-[#dce9e2] bg-white shadow-[0_1px_2px_rgba(27,54,65,0.06)]">
        <div className="grid grid-cols-7 border-b border-[#dce9e2]">
          {labels.weekdays.map((label) => (
            <p key={label} className="py-3 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-[#647e8c]">
              {label}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarCells.map((cell, index) => {
            const entries = cell.isCurrentMonth ? calendarDayMap.get(cell.day) ?? [] : [];
            const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
            const hasEntries = entries.length > 0;
            const progress = maxDailyExpense > 0 ? (total / maxDailyExpense) * 100 : 0;

            return (
              <button
                key={`cell-${index}-${cell.day}`}
                type="button"
                onClick={() => {
                  if (cell.isCurrentMonth && hasEntries && cell.isoDate) {
                    setActiveDayISO(cell.isoDate);
                  }
                }}
                disabled={!cell.isCurrentMonth || !hasEntries}
                className={`min-h-[112px] border-b border-r border-[#edf2ef] px-3 py-2 text-left transition last:border-r-0 ${
                  cell.isCurrentMonth
                    ? hasEntries
                      ? "cursor-pointer bg-white hover:bg-[#f4fff5]"
                      : "bg-white"
                    : "bg-[#f6fbf8] text-[#9aaeb7]"
                }`}
              >
                <p className="text-sm font-semibold text-[#1b3641]">{cell.day}</p>
                {cell.isCurrentMonth ? (
                  <div className="mt-2">
                    <p className={`text-[11px] font-bold ${hasEntries ? "text-[#006f1d]" : "text-[#93a7b3]"}`}>
                      {hasEntries ? asCurrency(total, currency) : "-"}
                    </p>
                    {hasEntries ? (
                      <div className="mt-1 h-1 w-full rounded-full bg-[#dff3de]">
                        <div className="h-full rounded-full bg-[#006f1d]" style={{ width: `${Math.max(8, Math.min(100, progress))}%` }} />
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </article>

      {activeDayISO ? (
        <>
          <button
            type="button"
            aria-label="Close details"
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
            onClick={() => setActiveDayISO(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-[#dce9e2] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{labels.detailsTitle}</h3>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#647e8c]">
                {new Intl.DateTimeFormat(language === "vi-VN" ? "vi-VN" : "en-US", {
                  month: "short",
                  day: "2-digit",
                }).format(new Date(activeDayISO))}
              </p>
            </div>

            <div className="max-h-72 space-y-3 overflow-auto pr-1">
              {activeDayEntries.map((entry) => (
                <article key={`day-entry-${entry.id}`} className="flex items-center justify-between border-b border-[#edf2ef] pb-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#1b3641]">
                      {entry.categoryName?.trim() || labels.fallbackTransaction}
                    </p>
                    <p className="text-[11px] text-[#647e8c]">
                      {new Intl.DateTimeFormat(language === "vi-VN" ? "vi-VN" : "en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(new Date(entry.dateISO))}
                    </p>
                  </div>
                  <p className="ml-3 text-sm font-bold text-[#0f7a2f]">{asCurrency(entry.amount, currency)}</p>
                </article>
              ))}

              {activeDayEntries.length === 0 ? (
                <p className="text-sm text-[#647e8c]">{labels.noExpenseData}</p>
              ) : null}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-[#edf2ef] pt-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#647e8c]">{labels.totalSpent}</p>
              <p className="font-[var(--font-manrope)] text-lg font-extrabold text-[#006f1d]">
                {asCurrency(activeDayEntries.reduce((sum, entry) => sum + entry.amount, 0), currency)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveDayISO(null)}
              className="mt-4 w-full rounded-xl bg-[#eaffe2] px-4 py-2.5 text-sm font-bold text-[#006f1d] hover:bg-[#dbf5dd]"
            >
              {labels.closeView}
            </button>
          </div>
        </>
      ) : null}
    </section>
  );
}
