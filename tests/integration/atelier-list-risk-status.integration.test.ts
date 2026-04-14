import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    categoryMonthlyLimit: {
      findMany: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/db";
import { getAtelierListData } from "@/lib/atelier";

const userFindUnique = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const categoryFindMany = prisma.category.findMany as unknown as ReturnType<typeof vi.fn>;
const categoryLimitFindMany = prisma.categoryMonthlyLimit.findMany as unknown as ReturnType<typeof vi.fn>;
const transactionFindMany = prisma.transaction.findMany as unknown as ReturnType<typeof vi.fn>;

describe("atelier list risk status integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    userFindUnique.mockResolvedValue({ settings: { timezone: "UTC" } });

    categoryFindMany.mockResolvedValue([
      { id: "cat_healthy", name: "Healthy", icon: "check" },
      { id: "cat_warning", name: "Warning", icon: "warning" },
      { id: "cat_overspent", name: "Overspent", icon: "dangerous" },
      { id: "cat_zero", name: "Zero", icon: "block" },
    ]);

    categoryLimitFindMany.mockImplementation(({ where }: { where: { monthStart: Date } }) => {
      const monthStart = where.monthStart.toISOString();
      if (monthStart !== "2026-04-01T00:00:00.000Z") {
        return [];
      }

      return [
        { categoryId: "cat_healthy", limit: 100, warningEnabled: true, warnAt: 80 },
        { categoryId: "cat_warning", limit: 100, warningEnabled: true, warnAt: 80 },
        { categoryId: "cat_overspent", limit: 100, warningEnabled: true, warnAt: 70 },
        { categoryId: "cat_zero", limit: 0, warningEnabled: true, warnAt: 80 },
      ];
    });

    transactionFindMany.mockResolvedValue([
      { categoryId: "cat_healthy", amount: 79 },
      { categoryId: "cat_warning", amount: 80 },
      { categoryId: "cat_overspent", amount: 180 },
      { categoryId: "cat_zero", amount: 10 },
    ]);
  });

  it("applies risk precedence overspent > warning > healthy and bounds usagePercent", async () => {
    const result = await getAtelierListData("u1", { month: "2026-04" });

    const healthy = result.categories.find((item) => item.id === "cat_healthy");
    const warning = result.categories.find((item) => item.id === "cat_warning");
    const overspent = result.categories.find((item) => item.id === "cat_overspent");
    const zero = result.categories.find((item) => item.id === "cat_zero");

    expect(healthy?.status).toBe("healthy");
    expect(warning?.status).toBe("warning");
    expect(overspent?.status).toBe("overspent");
    expect(zero?.status).toBe("overspent");

    expect(overspent?.usagePercent).toBe(100);
    expect(zero?.usagePercent).toBe(100);
  });

  it("marks row status as pending when snapshot data is partial", async () => {
    categoryFindMany.mockResolvedValue([{ id: "cat_partial", name: "Partial", icon: "pending" }]);
    categoryLimitFindMany.mockImplementation(({ where }: { where: { monthStart: Date } }) => {
      const monthStart = where.monthStart.toISOString();
      if (monthStart !== "2026-04-01T00:00:00.000Z") {
        return [];
      }

      return [{ categoryId: "cat_partial", limit: 200, warningEnabled: true, warnAt: null }];
    });
    transactionFindMany.mockResolvedValue([{ categoryId: "cat_partial", amount: 50 }]);

    const result = await getAtelierListData("u1", { month: "2026-04" });

    expect(result.categories).toHaveLength(1);
    expect(result.categories[0]).toMatchObject({
      id: "cat_partial",
      limit: 200,
      spent: 50,
      status: "pending",
    });
  });
});
