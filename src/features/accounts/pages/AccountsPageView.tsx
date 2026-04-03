"use client";

import MainWalletCard from "@/features/accounts/components/MainWalletCard";
import WalletCreateForm from "@/features/accounts/components/WalletCreateForm";
import { useNamespacedTranslation } from "@/features/i18n/useNamespacedTranslation";
import { formatCurrency } from "@/lib/format";

type WalletStat = {
  id: string;
  name: string;
  type: string;
  openingBalance: number;
  isDefault: boolean;
  balance: number;
};

type Wallet = {
  id: string;
  name: string;
  type: string;
  openingBalance: unknown;
  isDefault: boolean;
};

type Transaction = {
  accountId: string;
  type: string;
  amount: unknown;
};

type Props = {
  language: string;
  currency: string;
  wallets: Wallet[];
  transactions: Transaction[];
};

const toNumber = (value: unknown) => Number(value ?? 0);

const walletIcon = (type: string) => {
  if (type === "cash") return "savings";
  if (type === "credit") return "credit_card";
  if (type === "savings") return "account_balance";
  return "work";
};

export default function AccountsPageView({ language, currency, wallets, transactions }: Props) {
  const t = useNamespacedTranslation("accounts", language);

  const movementByWallet = new Map<string, number>();
  for (const tx of transactions) {
    const delta = tx.type === "income" || tx.type === "refund" ? toNumber(tx.amount) : -toNumber(tx.amount);
    movementByWallet.set(tx.accountId, (movementByWallet.get(tx.accountId) || 0) + delta);
  }

  const walletStats: WalletStat[] = wallets.map((wallet, index) => {
    const movement = movementByWallet.get(wallet.id) || 0;
    const openingBalance = toNumber(wallet.openingBalance);
    return {
      id: wallet.id,
      name: wallet.name,
      type: wallet.type,
      openingBalance,
      isDefault: wallet.isDefault || index === 0,
      balance: openingBalance + movement,
    };
  });

  const primary = walletStats[0];
  const secondary = walletStats[1];

  return (
    <div className="space-y-10">
      <section className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#6f8793]">{t("accountsPortfolio")}</p>
          <h1 className="font-[var(--font-manrope)] text-5xl font-extrabold leading-none tracking-tight text-[#1b3641] sm:text-6xl">
            {t("accountsYourAtelier")} <br />
            <span className="text-[#006f1d]">{t("accountsWallets")}.</span>
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="rounded-xl bg-[#d4ecf9] px-6 py-3 font-semibold text-[#49636f] hover:bg-[#c8e6f5]">
            {t("accountsArchiveOld")}
          </button>
          <WalletCreateForm language={language} currency={currency} />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-12">
        {primary ? (
          <MainWalletCard
            wallet={{
              id: primary.id,
              name: primary.name,
              type: primary.type,
              openingBalance: primary.openingBalance,
              isDefault: primary.isDefault,
              balance: primary.balance,
            }}
            currency={currency}
            language={language}
            icon={walletIcon(primary.type)}
          />
        ) : (
          <article className="rounded-[2rem] bg-[#e7f6ff] p-10 md:col-span-7">
            <h3 className="font-[var(--font-manrope)] text-2xl font-bold text-[#1b3641]">{t("accountsNoWallet")}</h3>
            <p className="mt-2 text-sm text-[#49636f]">{t("accountsCreateFirstWallet")}</p>
          </article>
        )}

        <div className="space-y-8 md:col-span-5">
          {secondary ? (
            <article className="rounded-[2rem] border border-transparent bg-white p-8 shadow-sm transition-all hover:border-[#9bb6c4]/30 hover:shadow-xl hover:shadow-emerald-900/5">
              <div className="mb-8 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-[#cfe6f2] p-3 text-[#40555f]">
                    <span className="material-symbols-outlined">{walletIcon(secondary.type)}</span>
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-[#1b3641]">{secondary.name}</h3>
                    <p className="text-xs text-[#6f8793]">{secondary.type}</p>
                  </div>
                </div>
                <WalletCreateForm
                  language={language}
                  currency={currency}
                  trigger="icon"
                  wallet={{
                  id: secondary.id,
                  name: secondary.name,
                  openingBalance: secondary.openingBalance,
                    isDefault: secondary.isDefault,
                  }}
                />
              </div>

              <div className="mb-6">
                <h2 className="font-[var(--font-manrope)] text-3xl font-bold text-[#1b3641]">
                  {formatCurrency(secondary.balance, currency)}
                </h2>
              </div>

              <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 rounded-full bg-[#e7f6ff] px-4 py-2 text-xs font-bold text-[#49636f] transition-colors hover:text-[#006f1d]">
                  <div className="relative h-4 w-8 rounded-full bg-[#cbe7f6] shadow-inner">
                    <div className="absolute left-1 top-1 h-2 w-2 rounded-full bg-[#49636f]/40" />
                  </div>
                  {t("accountsSetDefault")}
                </button>
              </div>
            </article>
          ) : (
            <article className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h3 className="font-[var(--font-manrope)] text-xl font-bold text-[#1b3641]">{t("accountsNoWallet")}</h3>
              <p className="mt-2 text-sm text-[#49636f]">{t("accountsCreateFirstWallet")}</p>
            </article>
          )}
        </div>
      </section>

      {walletStats.length > 2 ? (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {walletStats.slice(2).map((wallet) => (
            <article key={wallet.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#006f1d]">{walletIcon(wallet.type)}</span>
                  <h3 className="font-[var(--font-manrope)] text-lg font-bold text-[#1b3641]">{wallet.name}</h3>
                </div>
                <WalletCreateForm
                  language={language}
                  currency={currency}
                  trigger="icon"
                  wallet={{
                    id: wallet.id,
                    name: wallet.name,
                    openingBalance: wallet.openingBalance,
                    isDefault: wallet.isDefault,
                  }}
                />
              </div>
              <p className="text-xs uppercase tracking-[0.12em] text-[#6f8793]">{wallet.type}</p>
              <p className="mt-3 text-xl font-bold text-[#1b3641]">{formatCurrency(wallet.balance, currency)}</p>
            </article>
          ))}
        </section>
      ) : null}

    </div>
  );
}
