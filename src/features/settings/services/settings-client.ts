import { normalizeLanguage } from "@/features/i18n/language";
import type { SettingsPayload, UserSetting } from "@/features/settings/types";

const validCurrencies = new Set(["VND", "USD", "EUR", "JPY"]);
const validThemes = new Set(["light", "dark", "system"]);

const normalizeCurrency = (value?: string | null) => {
  if (!value) return "VND";
  const normalized = value.toUpperCase();
  return validCurrencies.has(normalized) ? normalized : "VND";
};

const normalizeTheme = (value?: string | null) => {
  if (!value) return "light";
  return validThemes.has(value) ? value : "light";
};

export const fetchSettings = async (): Promise<SettingsPayload> => {
  const response = await fetch("/api/settings", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Could not load user settings.");
  }

  return (await response.json()) as SettingsPayload;
};

export const resolveUserSetting = (payload?: SettingsPayload): UserSetting => ({
  currency: normalizeCurrency(payload?.settings?.currency),
  language: normalizeLanguage(payload?.settings?.language),
  theme: normalizeTheme(payload?.settings?.theme),
});
