import { DateTime } from "luxon";

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
