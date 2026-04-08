import { addMonthsDate, asDateTime, endOfMonthDate, nowDate, startOfMonthDate } from "@/lib/date";

export const shouldRunMonthEndAllocationCron = (referenceDate: Date = nowDate()) => {
  const now = asDateTime(referenceDate);
  const endOfCurrentMonth = asDateTime(endOfMonthDate(referenceDate));
  const isEndOfMonthWindow = now.hasSame(endOfCurrentMonth, "day") && now.hour >= 23;
  const isFirstDayCatchupWindow = now.day === 1 && now.hour < 2;

  return {
    shouldRun: isEndOfMonthWindow || isFirstDayCatchupWindow,
    isFirstDayCatchupWindow,
  };
};

export const resolveProcessingMonthStart = (referenceDate: Date = nowDate()) => {
  const gate = shouldRunMonthEndAllocationCron(referenceDate);
  if (!gate.shouldRun) {
    return null;
  }

  return gate.isFirstDayCatchupWindow
    ? startOfMonthDate(addMonthsDate(referenceDate, -1))
    : startOfMonthDate(referenceDate);
};
