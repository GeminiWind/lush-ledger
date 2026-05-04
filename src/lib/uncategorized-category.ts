import { prisma } from "@/lib/db";

const UNCATEGORIZED_NAME = "Uncategorized";

type CategoryTx = Pick<typeof prisma, "category">;

export const ensureUncategorizedCategory = async (tx: CategoryTx, userId: string) => {
  const existing = await tx.category.findFirst({
    where: {
      userId,
      isSystem: true,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (existing) {
    return existing.id;
  }

  const legacyNamed = await tx.category.findFirst({
    where: {
      userId,
      name: UNCATEGORIZED_NAME,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (legacyNamed) {
    await tx.category.update({
      where: { id: legacyNamed.id },
      data: { isSystem: true },
    });

    return legacyNamed.id;
  }

  const created = await tx.category.create({
    data: {
      userId,
      name: UNCATEGORIZED_NAME,
      icon: "category",
      isSystem: true,
      deletedAt: null,
    },
    select: { id: true },
  });

  return created.id;
};
