import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/recurring", () => ({
  materializeRecurringTransactions: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/monthly-cap", () => ({
  ensureMonthlyCapSnapshot: vi.fn().mockResolvedValue({ totalCap: 1500000, totalLimit: 0 }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    account: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    category: {
      findMany: vi.fn().mockResolvedValue([{ id: "c1", name: "Tien dien", icon: "bolt" }]),
    },
    savingsPlan: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    transaction: {
      findMany: vi
        .fn()
        .mockResolvedValueOnce([
          {
            id: "t1",
            accountId: "a1",
            type: "expense",
            amount: 1200000,
            date: new Date("2026-04-06T00:00:00.000Z"),
            categoryId: "c1",
            savingsPlanId: null,
            account: { name: "Main" },
            category: { name: "Tien dien", icon: "bolt" },
          },
        ])
        .mockResolvedValueOnce([
          {
            id: "t1",
            type: "expense",
            amount: 1200000,
            date: new Date("2026-04-06T00:00:00.000Z"),
            categoryId: "c1",
            category: { name: "Tien dien" },
          },
        ])
        .mockResolvedValueOnce([]),
    },
    categoryMonthlyLimit: {
      findMany: vi.fn().mockResolvedValue([
        {
          categoryId: "c1",
          limit: 1500000,
          warningEnabled: true,
          warnAt: 80,
        },
      ]),
    },
  },
}));

import { getDashboardData } from "@/lib/dashboard";

describe("dashboard active budget warning state", () => {
  it("marks budget as warning when usage reaches warnAt and not overspent", async () => {
    const data = await getDashboardData("user-1");
    const tienDien = data.activeBudgets.find((item) => item.id === "c1");

    expect(tienDien).toBeDefined();
    expect(tienDien?.isOverspent).toBe(false);
    expect(tienDien?.isWarning).toBe(true);
    expect(tienDien?.spent).toBe(1200000);
    expect(tienDien?.budget).toBe(1500000);
  });
});
