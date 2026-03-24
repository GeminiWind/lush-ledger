import { prisma } from "@/lib/db";

export const ensureDefaultWallet = async (userId: string) => {
  const existing = await prisma.account.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return existing;
  }

  return prisma.account.create({
    data: {
      userId,
      name: "Main Wallet",
      type: "cash",
      openingBalance: 0,
    },
  });
};
