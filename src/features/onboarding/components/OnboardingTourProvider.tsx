"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { TourProvider, type StepType, useTour } from "@reactour/tour";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import type { OnboardingTourProviderProps } from "@/features/onboarding/types";

const TOUR_STORAGE_KEY = "lush-ledger:onboarding-tour:v1";

export default function OnboardingTourProvider({ language, children }: OnboardingTourProviderProps) {
  const pathname = usePathname();
  const t = useNamespacedTranslation("onboarding", language);

  const steps = useMemo<StepType[]>(
    () => {
      return [
        {
          selector: ".tour-sidebar",
          content: t("onboarding.onboardingSidebar"),
        },
        {
          selector: ".tour-nav-dashboard",
          content: t("onboarding.onboardingDashboard"),
        },
        {
          selector: ".tour-nav-atelier",
          content: t("onboarding.onboardingAtelier"),
        },
        {
          selector: ".tour-nav-ledger",
          content: t("onboarding.onboardingLedger"),
        },
        {
          selector: ".tour-nav-savings",
          content: t("onboarding.onboardingSavings"),
        },
        {
          selector: ".tour-nav-wallets",
          content: t("onboarding.onboardingWallets"),
        },
        {
          selector: ".tour-new-entry",
          content: t("onboarding.onboardingNewEntry"),
        },
        {
          selector: ".tour-nav-settings",
          content: t("onboarding.onboardingSettings"),
        },
        {
          selector: ".tour-main-content",
          content: t("onboarding.onboardingMainContent"),
        },
      ];
    },
    [t],
  );

  return (
    <TourProvider
      steps={steps}
      showBadge
      showCloseButton
      showNavigation
      beforeClose={() => {
        window.localStorage.setItem(TOUR_STORAGE_KEY, "done");
      }}
      styles={{
        badge: (base) => ({ ...base, background: "#006f1d" }),
        popover: (base) => ({ ...base, borderRadius: 16, color: "#1b3641" }),
      }}
    >
      <TourAutoStarter pathname={pathname} />
      {children}
    </TourProvider>
  );
}

function TourAutoStarter({ pathname }: { pathname: string }) {
  const { setIsOpen, setCurrentStep } = useTour();

  useEffect(() => {
    if (pathname !== "/app") {
      return;
    }

    const completed = window.localStorage.getItem(TOUR_STORAGE_KEY) === "done";
    if (!completed) {
      setCurrentStep(0);
      setIsOpen(true);
    }
  }, [pathname, setCurrentStep, setIsOpen]);

  return null;
}
