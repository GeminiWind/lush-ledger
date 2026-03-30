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
