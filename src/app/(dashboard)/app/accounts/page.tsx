import { AccountsPageView } from "@/features/accounts";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { ensureDefaultWallet } from "@/lib/wallet";

export default async function AccountsPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";
  const currency = user.settings?.currency || "VND";

  await ensureDefaultWallet(user.id);

  const [wallets, transactions] = await Promise.all([
    prisma.account.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
        openingBalance: true,
        isDefault: true,
      },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      select: { accountId: true, type: true, amount: true },
    }),
  ]);

  return (
    <AccountsPageView
      language={language}
      currency={currency}
      wallets={wallets}
      transactions={transactions}
    />
  );
}
