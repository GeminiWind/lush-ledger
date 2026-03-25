"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { TourProvider, type StepType, useTour } from "@reactour/tour";
import { getDictionaryBySection } from "@/lib/i18n";

const TOUR_STORAGE_KEY = "lush-ledger:onboarding-tour:v1";

type Props = {
  language: string;
  children: React.ReactNode;
};

export default function OnboardingTourProvider({ language, children }: Props) {
  const pathname = usePathname();

  const steps = useMemo<StepType[]>(
    () => {
      const t = getDictionaryBySection(language).onboarding;
      return [
        {
          selector: ".tour-sidebar",
          content: t.onboardingSidebar,
        },
        {
          selector: ".tour-nav-dashboard",
          content: t.onboardingDashboard,
        },
        {
          selector: ".tour-nav-atelier",
          content: t.onboardingAtelier,
        },
        {
          selector: ".tour-nav-ledger",
          content: t.onboardingLedger,
        },
        {
          selector: ".tour-nav-savings",
          content: t.onboardingSavings,
        },
        {
          selector: ".tour-nav-wallets",
          content: t.onboardingWallets,
        },
        {
          selector: ".tour-new-entry",
          content: t.onboardingNewEntry,
        },
        {
          selector: ".tour-nav-settings",
          content: t.onboardingSettings,
        },
        {
          selector: ".tour-main-content",
          content: t.onboardingMainContent,
        },
      ];
    },
    [language],
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
