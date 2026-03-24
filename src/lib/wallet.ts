import { prisma } from "@/lib/db";

export const ensureDefaultWallet = async (userId: string) => {
  const existingDefault = await prisma.account.findFirst({
    where: { userId, isDefault: true },
    orderBy: { createdAt: "asc" },
  });

  if (existingDefault) {
    return existingDefault;
  }

  const existing = await prisma.account.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  if (existing) {
    return prisma.account.update({
      where: { id: existing.id },
      data: { isDefault: true },
    });
  }

  return prisma.account.create({
    data: {
      userId,
      name: "Main Wallet",
      type: "cash",
      isDefault: true,
      openingBalance: 0,
    },
  });
};
