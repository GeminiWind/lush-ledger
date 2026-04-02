"use client";

import { useQuery } from "@tanstack/react-query";
import { normalizeLanguage, type AppLanguage } from "@/lib/i18n";

type SettingsPayload = {
  settings?: {
    name?: string;
    email?: string;
    currency?: string;
    language?: string;
    theme?: string;
  };
};

type UserSetting = {
  currency: string;
  language: AppLanguage;
  theme: string;
};

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

export const useUserSetting = () => {
  const query = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load user settings.");
      }

      return (await response.json()) as SettingsPayload;
    },
    staleTime: 5 * 60 * 1000,
  });

  const setting: UserSetting = {
    currency: normalizeCurrency(query.data?.settings?.currency),
    language: normalizeLanguage(query.data?.settings?.language),
    theme: normalizeTheme(query.data?.settings?.theme),
  };

  return {
    ...query,
    ...setting,
    setting,
  };
};
