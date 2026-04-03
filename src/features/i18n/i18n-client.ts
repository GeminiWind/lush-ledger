"use client";

import { createInstance } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "@/features/i18n/locales/en.json";
import vi from "@/features/i18n/locales/vi.json";

const resources = {
  "en-US": en,
  "vi-VN": vi,
} as const;

const namespaces = Object.keys(resources["en-US"]);

export const appI18n = createInstance();

if (!appI18n.isInitialized) {
  void appI18n.use(initReactI18next).init({
    resources,
    lng: "en-US",
    fallbackLng: "en-US",
    ns: namespaces,
    defaultNS: "common",
    fallbackNS: namespaces,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}
