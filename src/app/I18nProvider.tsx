"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { I18nextProvider } from "react-i18next";
import { appI18n } from "@/features/i18n/i18n-client";
import { normalizeLanguage } from "@/features/i18n/language";
import { useUserSetting } from "@/features/settings/hooks/useUserSetting";

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReadSettings = pathname.startsWith("/app");
  const { language } = useUserSetting(shouldReadSettings);

  useEffect(() => {
    void appI18n.changeLanguage(normalizeLanguage(language));
  }, [language]);

  return <I18nextProvider i18n={appI18n}>{children}</I18nextProvider>;
}
