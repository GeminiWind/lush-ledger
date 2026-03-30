export const currencyLocale = (currency: string) => (currency === "VND" ? "vi-VN" : "en-US");

export const formatCurrency = (value: number, currency: string) => {
  const locale = currencyLocale(currency);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "VND" ? 0 : 2,
  }).format(value);
};

const digitsOnly = (value: string) => value.replace(/\D/g, "");

export const parseCurrencyInput = (value: string) => {
  const digits = digitsOnly(value);
  if (!digits) {
    return 0;
  }
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const formatCurrencyInput = (value: string, currency: string) => {
  const digits = digitsOnly(value);
  if (!digits) {
    return "";
  }
  return new Intl.NumberFormat(currencyLocale(currency), {
    maximumFractionDigits: 0,
  }).format(Number(digits));
};

const DEFAULT_SUGGESTION_MULTIPLIERS = [1000, 10000, 1000000] as const;

export const getCurrencyInputSuggestions = (
  displayValue: string,
  currency: string,
  multipliers: readonly number[] = DEFAULT_SUGGESTION_MULTIPLIERS,
) => {
  const rawDigits = digitsOnly(displayValue);
  if (!rawDigits || rawDigits.length > 3) {
    return [];
  }

  const baseAmount = parseCurrencyInput(displayValue);
  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    return [];
  }

  const uniqueValues = Array.from(new Set(multipliers.map((multiplier) => baseAmount * multiplier)));
  return uniqueValues.map((value) => ({
    value,
    label: `${formatCurrencyInput(String(value), currency)}${currency === "VND" ? "đ" : ""}`,
  }));
};
