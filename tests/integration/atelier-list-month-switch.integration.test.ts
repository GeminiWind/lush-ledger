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

describe("atelier list month switch integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    userFindUnique.mockResolvedValue({
      settings: {
        timezone: "UTC",
      },
    });

    categoryFindMany.mockResolvedValue([
      { id: "cat_b", name: "Bills", icon: "receipt_long" },
      { id: "cat_a1", name: "Food", icon: "restaurant" },
      { id: "cat_a2", name: "Food", icon: "lunch_dining" },
    ]);

    categoryLimitFindMany.mockImplementation(({ where }: { where: { monthStart: Date } }) => {
      const monthStart = where.monthStart.toISOString();

      if (monthStart === "2026-04-01T00:00:00.000Z") {
        return [
          { categoryId: "cat_b", limit: 100, warningEnabled: true, warnAt: 70 },
          { categoryId: "cat_a1", limit: 200, warningEnabled: true, warnAt: 80 },
        ];
      }

      if (monthStart === "2026-05-01T00:00:00.000Z") {
        return [
          { categoryId: "cat_b", limit: 100, warningEnabled: true, warnAt: 70 },
          { categoryId: "cat_a2", limit: 300, warningEnabled: true, warnAt: 75 },
        ];
      }

      if (monthStart === "2026-06-01T00:00:00.000Z") {
        return [{ categoryId: "cat_a2", limit: 300, warningEnabled: true, warnAt: 75 }];
      }

      return [];
    });

    transactionFindMany.mockImplementation(({ where }: { where: { date: { gte: Date } } }) => {
      const monthStart = where.date.gte.toISOString();

      if (monthStart === "2026-04-01T00:00:00.000Z") {
        return [
          { categoryId: "cat_b", amount: 80 },
          { categoryId: "cat_a1", amount: 50 },
          { categoryId: null, amount: 9999 },
        ];
      }

      if (monthStart === "2026-05-01T00:00:00.000Z") {
        return [
          { categoryId: "cat_b", amount: 20 },
          { categoryId: "cat_a2", amount: 330 },
        ];
      }

      return [];
    });
  });

  it("returns canonical ordered user-scoped rows for selected month", async () => {
    const result = await getAtelierListData("u1", { month: "2026-04" });

    expect(result.month).toBe("2026-04");
    expect(result.categories.map((item) => item.id)).toEqual(["cat_b", "cat_a1", "cat_a2"]);

    expect(result.categories).toMatchObject([
      {
        id: "cat_b",
        name: "Bills",
        limit: 100,
        spent: 80,
        warningEnabled: true,
        warnAt: 70,
        carryNextMonth: true,
      },
      {
        id: "cat_a1",
        name: "Food",
        limit: 200,
        spent: 50,
        warningEnabled: true,
        warnAt: 80,
        carryNextMonth: false,
      },
      {
        id: "cat_a2",
        name: "Food",
        limit: 0,
        spent: 0,
        warningEnabled: true,
        warnAt: 80,
        carryNextMonth: false,
      },
    ]);
  });

  it("refreshes rows for switched month", async () => {
    const result = await getAtelierListData("u1", { month: "2026-05" });

    expect(result.month).toBe("2026-05");
    expect(result.categories.map((item) => item.id)).toEqual(["cat_b", "cat_a1", "cat_a2"]);

    expect(result.categories).toMatchObject([
      {
        id: "cat_b",
        limit: 100,
        spent: 20,
        carryNextMonth: false,
      },
      {
        id: "cat_a1",
        limit: 0,
        spent: 0,
        warningEnabled: true,
        warnAt: 80,
        carryNextMonth: false,
      },
      {
        id: "cat_a2",
        limit: 300,
        spent: 330,
        carryNextMonth: true,
      },
    ]);
  });
});
