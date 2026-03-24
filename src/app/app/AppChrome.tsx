"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import OnboardingTourProvider from "@/app/app/OnboardingTourProvider";
import { getDictionary } from "@/lib/i18n";

const navItems = [
  { href: "/app", key: "navDashboard", icon: "dashboard" },
  { href: "/app/atelier", key: "navAtelier", icon: "auto_awesome" },
  { href: "/app/ledger", key: "navLedger", icon: "account_balance_wallet" },
  { href: "/app/savings", key: "navSavings", icon: "savings" },
  { href: "/app/accounts", key: "navWallets", icon: "account_balance_wallet" },
  { href: "/app/settings", key: "navSettings", icon: "settings" },
] as const;

const tourClassByHref: Record<string, string> = {
  "/app": "tour-nav-dashboard",
  "/app/atelier": "tour-nav-atelier",
  "/app/ledger": "tour-nav-ledger",
  "/app/savings": "tour-nav-savings",
  "/app/accounts": "tour-nav-wallets",
  "/app/settings": "tour-nav-settings",
};

const isActive = (href: string, pathname: string) => {
  if (href === "/app") {
    return pathname === "/app";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
};

type Props = {
  userEmail: string;
  language: string;
  children: React.ReactNode;
};

export default function AppChrome({ userEmail, language, children }: Props) {
  const pathname = usePathname();
  const t = getDictionary(language);

  return (
    <OnboardingTourProvider language={language}>
      <div className="h-screen overflow-hidden bg-[#edf4ef] text-[#1b3641]">
        <div className="flex h-full w-full">
          <aside className="tour-sidebar hidden h-full w-60 flex-col border-r border-[#d8e4dc] bg-[#e7efe9] p-4 shadow-[20px_0_20px_-10px_rgba(27,54,65,0.04)] lg:flex">
          <div className="mb-6 flex items-center gap-3 px-2 py-1">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#006f1d] text-[#eaffe2]">
              <span className="material-symbols-outlined text-lg">account_balance</span>
            </div>
            <div>
              <p className="font-[var(--font-manrope)] text-xl font-extrabold tracking-tight text-[#1b3641]">Lush Ledger</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#647e8c]">The Fiscal Atelier</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href, pathname);
              return (
                <Link
                  key={`${item.href}-${item.key}`}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${tourClassByHref[item.href] || ""} ${
                    active
                      ? "bg-white/85 text-[#1b3641] shadow-[0_8px_24px_-14px_rgba(27,54,65,0.22)]"
                      : "text-[#49636f] hover:bg-white/40 hover:text-[#1b3641]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span>{t[item.key]}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-4">
            <Link
              href="/app/ledger/new"
              className="tour-new-entry flex w-full items-center justify-center gap-2 rounded-lg bg-[#006f1d] px-4 py-2.5 text-sm font-bold text-[#eaffe2] shadow-[0_14px_30px_-12px_rgba(0,111,29,0.45)] hover:brightness-105"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>{t.actionNewEntry}</span>
            </Link>
          </div>
        </aside>

          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-20 shrink-0 border-b border-[#d8e8f3] bg-white/85 backdrop-blur-xl shadow-[0_8px_28px_-20px_rgba(27,54,65,0.3)]">
            <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-10">
              <div>
                <p className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">
                  Lush Ledger
                </p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6f8793]">
                  {t.headerBrandSub}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right leading-tight sm:block">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#6f8793]">{t.headerUserRole}</p>
                  <p className="max-w-[260px] truncate font-[var(--font-manrope)] text-sm font-bold text-[#1b3641]">{userEmail}</p>
                </div>
                <div className="h-11 w-11 overflow-hidden rounded-full border-2 border-[#d7e8f3] bg-[#dfeef8]">
                  <Image
                    src="/images/app/fiscal-atelier-avatar.png"
                    alt="User avatar"
                    width={44}
                    height={44}
                    className="h-full w-full object-cover"
                  />
                </div>
                <form action="/api/auth/logout" method="post">
                  <button className="rounded-lg border border-[#c8d8ce] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#49636f] hover:border-[#93b3a0] hover:text-[#1b3641]">
                    {t.actionLogout}
                  </button>
                </form>
              </div>
            </div>
          </header>
            <main className="tour-main-content flex-1 overflow-auto px-6 py-8 lg:px-10">{children}</main>
          </div>
        </div>
      </div>
    </OnboardingTourProvider>
  );
}
