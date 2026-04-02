import type { AppLanguage } from "@/lib/i18n";

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
