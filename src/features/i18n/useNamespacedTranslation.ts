"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { normalizeLanguage } from "@/features/i18n/language";

const resolveNamespace = (key: string, fallback: string) => {
  if (key.startsWith("dash")) return "dashboard";
  if (key.startsWith("ledger")) return "ledger";
  if (key.startsWith("tx")) return "transaction";
  if (key.startsWith("newEntry")) return "newEntry";
  if (key.startsWith("accounts")) return "accounts";
  if (key.startsWith("wallet")) return "wallet";
  if (key.startsWith("atelier") || key.startsWith("topCategories") || key.startsWith("activeBudgets") || key.startsWith("reports")) return "atelier";
  if (key.startsWith("savings")) return "savings";
  if (key.startsWith("settings")) return "settings";
  if (key.startsWith("calendar")) return "calendar";
  if (key.startsWith("onboarding")) return "onboarding";
  if (key.startsWith("nav") || key.startsWith("action") || key.startsWith("header") || key.startsWith("error")) return "common";
  return fallback;
};

export const useNamespacedTranslation = (namespace: string, language?: string | null) => {
  const normalizedLanguage = normalizeLanguage(language);
  const { t } = useTranslation(undefined, {
    lng: normalizedLanguage,
    useSuspense: false,
  });

  return useMemo(() => {
    const translate = (key: string) => {
      const [maybeNamespace, ...rest] = key.split(".");
      if (rest.length > 0) {
        return t(rest.join("."), { ns: maybeNamespace, defaultValue: key });
      }

      const ns = resolveNamespace(key, namespace);
      return t(key, { ns, defaultValue: key });
    };

    return new Proxy(
      translate,
      {
        apply(target, _, argArray) {
          const [key] = argArray as [string];
          return target(key);
        },
        get(_, property) {
          if (typeof property !== "string") {
            return "";
          }

          return translate(property);
        },
      },
    ) as ((key: string) => string) & Record<string, string>;
  }, [namespace, t]);
};
