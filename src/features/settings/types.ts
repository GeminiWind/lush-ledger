import type { AppLanguage } from "@/features/i18n/language";

export type UserSetting = {
  currency: string;
  language: AppLanguage;
  theme: string;
};

export type SettingsPayload = {
  settings?: {
    name?: string;
    email?: string;
    currency?: string;
    language?: string;
    theme?: string;
  };
};
