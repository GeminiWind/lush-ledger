"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { TourProvider, type StepType, useTour } from "@reactour/tour";
import { tr } from "@/lib/i18n";

const TOUR_STORAGE_KEY = "lush-ledger:onboarding-tour:v1";

type Props = {
  language: string;
  children: React.ReactNode;
};

export default function OnboardingTourProvider({ language, children }: Props) {
  const pathname = usePathname();

  const steps = useMemo<StepType[]>(
    () => [
      {
        selector: ".tour-sidebar",
        content: tr(
          language,
          "Welcome to Lush Ledger. This sidebar is your control center for dashboard, budgets, ledger, savings, wallets, and settings.",
          "Chào mừng bạn đến với Lush Ledger. Thanh bên này là trung tâm điều hướng cho tổng quan, ngân sách, giao dịch, tiết kiệm, ví và cài đặt.",
        ),
      },
      {
        selector: ".tour-nav-dashboard",
        content: tr(
          language,
          "Start here: Dashboard gives a fast health check of net worth, spending, and active budgets.",
          "Bắt đầu từ đây: Tổng quan cho bạn bức tranh nhanh về tài sản ròng, chi tiêu và ngân sách đang theo dõi.",
        ),
      },
      {
        selector: ".tour-nav-atelier",
        content: tr(
          language,
          "Atelier is your monthly budget studio. Set category limits, see healthy/warning/overspent signals, and rebalance faster.",
          "Atelier là nơi quản lý ngân sách theo tháng. Bạn đặt hạn mức danh mục, theo dõi trạng thái ổn định/cảnh báo/vượt mức và cân đối nhanh hơn.",
        ),
      },
      {
        selector: ".tour-nav-ledger",
        content: tr(
          language,
          "Ledger is your transaction timeline. Search, filter, and audit every income/expense entry in one place.",
          "Ledger là dòng thời gian giao dịch của bạn. Tìm kiếm, lọc và đối chiếu mọi khoản thu/chi tại một nơi.",
        ),
      },
      {
        selector: ".tour-nav-savings",
        content: tr(
          language,
          "Savings tracks plan targets and monthly contributions, so you can forecast progress toward each financial goal.",
          "Savings giúp theo dõi mục tiêu tiết kiệm và đóng góp hằng tháng, để dự báo tiến độ cho từng mục tiêu tài chính.",
        ),
      },
      {
        selector: ".tour-nav-wallets",
        content: tr(
          language,
          "Wallets organize money sources. Keep separate balances (cash, checking, savings) and set a default wallet for new entries.",
          "Wallets giúp tách các nguồn tiền. Bạn quản lý số dư riêng (tiền mặt, tài khoản thanh toán, tiết kiệm) và đặt ví mặc định cho giao dịch mới.",
        ),
      },
      {
        selector: ".tour-new-entry",
        content: tr(
          language,
          "Use New Entry to log income or expense. Keeping entries current makes all analytics accurate.",
          "Dùng Thêm giao dịch để ghi thu nhập hoặc chi tiêu. Ghi nhật ký đầy đủ sẽ giúp báo cáo chính xác.",
        ),
      },
      {
        selector: ".tour-nav-settings",
        content: tr(
          language,
          "In Settings, choose language, currency, and theme for your workspace.",
          "Tại Cài đặt, bạn có thể chọn ngôn ngữ, tiền tệ và giao diện cho không gian làm việc.",
        ),
      },
      {
        selector: ".tour-main-content",
        content: tr(
          language,
          "This is your main workspace. Explore cards and reports to track your money flow and goals.",
          "Đây là khu vực làm việc chính. Khám phá các thẻ và báo cáo để theo dõi dòng tiền và mục tiêu.",
        ),
      },
    ],
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
