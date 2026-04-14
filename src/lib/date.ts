import { DateTime } from "luxon";

const MONTH_QUERY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const DEFAULT_TIMEZONE = "UTC";
export const INVALID_MONTH_QUERY_MESSAGE = "month must be in YYYY-MM format";

export const nowDate = () => DateTime.now().toJSDate();

export const asDateTime = (value: Date | string, zone: "local" | "utc" = "local") => {
  if (typeof value === "string") {
    return DateTime.fromISO(value, { zone });
  }
  return DateTime.fromJSDate(value, { zone });
};

export const startOfMonthDate = (value: Date) => asDateTime(value).startOf("month").toJSDate();

export const endOfMonthDate = (value: Date) => asDateTime(value).endOf("month").toJSDate();

export const addMonthsDate = (value: Date, months: number) => asDateTime(value).plus({ months }).toJSDate();

export const addDaysDate = (value: Date, days: number) => asDateTime(value).plus({ days }).toJSDate();

export const getMonthRange = (input: Date) => {
  const dateTime = asDateTime(input);
  return {
    start: dateTime.startOf("month").toJSDate(),
    end: dateTime.endOf("month").toJSDate(),
  };
};

export const parseMonthQuery = (value: string | null | undefined) => {
  const month = String(value || "").trim();
  if (!month) {
    return { ok: true as const, month: null };
  }

  if (!MONTH_QUERY_PATTERN.test(month)) {
    return {
      ok: false as const,
      errors: {
        month: INVALID_MONTH_QUERY_MESSAGE,
      },
    };
  }

  return { ok: true as const, month };
};

export const resolveTimezone = (timezone: string | null | undefined, fallbackTimezone = DEFAULT_TIMEZONE) => {
  const primary = String(timezone || "").trim();
  if (primary && DateTime.now().setZone(primary).isValid) {
    return primary;
  }

  const fallback = String(fallbackTimezone || DEFAULT_TIMEZONE).trim() || DEFAULT_TIMEZONE;
  if (DateTime.now().setZone(fallback).isValid) {
    return fallback;
  }

  return DEFAULT_TIMEZONE;
};

type ResolveMonthRangeInput = {
  month?: string | null;
  timezone?: string | null;
  fallbackTimezone?: string;
  now?: Date;
};

export const resolveMonthRangeFromQuery = ({
  month,
  timezone,
  fallbackTimezone = DEFAULT_TIMEZONE,
  now = nowDate(),
}: ResolveMonthRangeInput) => {
  const parsed = parseMonthQuery(month);
  if (!parsed.ok) {
    return parsed;
  }

  const activeTimezone = resolveTimezone(timezone, fallbackTimezone);
  const fallbackMonth = DateTime.fromJSDate(now, { zone: "utc" }).setZone(activeTimezone).toFormat("yyyy-MM");
  const selectedMonth = parsed.month || fallbackMonth;

  const monthStart = DateTime.fromFormat(selectedMonth, "yyyy-MM", {
    zone: activeTimezone,
    setZone: true,
  }).startOf("month");

  if (!monthStart.isValid) {
    return {
      ok: false as const,
      errors: {
        month: INVALID_MONTH_QUERY_MESSAGE,
      },
    };
  }

  return {
    ok: true as const,
    month: monthStart.toFormat("yyyy-MM"),
    timezone: activeTimezone,
    start: monthStart.toUTC().toJSDate(),
    end: monthStart.endOf("month").toUTC().toJSDate(),
    nextMonthStart: monthStart.plus({ months: 1 }).startOf("month").toUTC().toJSDate(),
  };
};

export const monthKey = (value: Date) => asDateTime(value).toFormat("yyyy-MM");

export const toISODate = (value: Date) => asDateTime(value).toISODate() || "";

export const fromISODate = (value: string) => {
  const parsed = DateTime.fromISO(value);
  return parsed.isValid ? parsed.toJSDate() : null;
};

export const isValidISODate = (value: string) => DateTime.fromISO(value).isValid;

export const sameDay = (left: Date, right: Date) => asDateTime(left).hasSame(asDateTime(right), "day");

export const localeDateLabel = (
  value: Date,
  locale: string,
  format: Intl.DateTimeFormatOptions,
) => asDateTime(value).setLocale(locale).toLocaleString(format);

export const localeTimeLabel = (
  value: Date,
  locale: string,
  format: Intl.DateTimeFormatOptions,
) => asDateTime(value).setLocale(locale).toLocaleString(format);

export const dayOfMonth = (value: Date) => asDateTime(value).day;

export const daysUntil = (date: Date, from: Date) => Math.ceil(asDateTime(date).diff(asDateTime(from), "days").days);
