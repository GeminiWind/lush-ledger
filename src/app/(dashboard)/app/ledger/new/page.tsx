import { NewLedgerEntryPageView } from "@/features/ledger";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/user";
import { ensureDefaultWallet } from "@/lib/wallet";

export default async function NewLedgerEntryPage() {
  const user = await requireUser();
  const language = user.settings?.language || "en-US";

  await ensureDefaultWallet(user.id);

  const [categories, wallets] = await Promise.all([
    prisma.category.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <NewLedgerEntryPageView
      language={language}
      categories={categories}
      wallets={wallets}
      defaultWalletId={wallets[0]?.id || ""}
    />
  );
}
