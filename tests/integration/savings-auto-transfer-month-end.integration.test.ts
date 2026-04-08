import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    autoTransferRule: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    autoTransferRun: {
      findUnique: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    transaction: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    savingsPlan: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/wallet", () => ({
  ensureDefaultWallet: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { ensureDefaultWallet } from "@/lib/wallet";
import { executeMonthEndAutoTransferForUser } from "@/lib/savings-auto-transfer";

const userFindUnique = prisma.user.findUnique as unknown as ReturnType<typeof vi.fn>;
const ruleFindUnique = prisma.autoTransferRule.findUnique as unknown as ReturnType<typeof vi.fn>;
const runFindUnique = prisma.autoTransferRun.findUnique as unknown as ReturnType<typeof vi.fn>;
const runCreate = prisma.autoTransferRun.create as unknown as ReturnType<typeof vi.fn>;
const txFindMany = prisma.transaction.findMany as unknown as ReturnType<typeof vi.fn>;
const txCreate = prisma.transaction.create as unknown as ReturnType<typeof vi.fn>;
const savingsPlanFindMany = prisma.savingsPlan.findMany as unknown as ReturnType<typeof vi.fn>;
const walletEnsure = ensureDefaultWallet as unknown as ReturnType<typeof vi.fn>;

const parsePlanResults = (value: unknown) => {
  if (typeof value !== "string") {
    return [] as Array<{ savingsPlanId: string; status: string; appliedAmount: number }>;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

describe("savings auto-transfer month-end execution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    userFindUnique.mockResolvedValue({ settings: { timezone: "UTC", currency: "VND" } });
    ruleFindUnique.mockResolvedValue({
      enabled: true,
      allocations: [
        { savingsPlanId: "sp1", percentage: 50 },
        { savingsPlanId: "sp2", percentage: 50 },
      ],
    });
    runFindUnique.mockResolvedValue(null);
    txFindMany.mockResolvedValue([
      { type: "income", amount: 1000 },
      { type: "expense", amount: 200 },
    ]);
    savingsPlanFindMany.mockResolvedValue([
      {
        id: "sp1",
        name: "Emergency",
        status: "active",
        targetAmount: 500,
        transactions: [{ type: "income", amount: 200 }],
      },
      {
        id: "sp2",
        name: "Travel",
        status: "active",
        targetAmount: 2000,
        transactions: [],
      },
    ]);
    walletEnsure.mockResolvedValue({ id: "wallet-1" });
    txCreate
      .mockResolvedValueOnce({ id: "tx-plan-1" })
      .mockResolvedValueOnce({ id: "tx-plan-2" });
    runCreate.mockImplementation(async (payload) => payload.data);
  });

  it("applies positive remainder with per-plan cap", async () => {
    const run = await executeMonthEndAutoTransferForUser({
      userId: "u1",
      monthStartISO: "2026-04-01",
      timezone: "UTC",
    });

    expect(txCreate).toHaveBeenCalledTimes(2);
    expect(txCreate.mock.calls[0]?.[0]?.data?.amount).toBe(300);
    expect(txCreate.mock.calls[1]?.[0]?.data?.amount).toBe(400);
    expect(run.status).toBe("applied");
    const planResults = parsePlanResults(run.planResults);
    expect(planResults[0]?.appliedAmount).toBe(300);
  });

  it("marks run skipped when remainder is non-positive", async () => {
    txFindMany.mockResolvedValueOnce([
      { type: "income", amount: 200 },
      { type: "expense", amount: 250 },
    ]);

    const run = await executeMonthEndAutoTransferForUser({
      userId: "u1",
      monthStartISO: "2026-04-01",
      timezone: "UTC",
    });

    expect(txCreate).not.toHaveBeenCalled();
    expect(run.status).toBe("skipped");
    expect(run.skipReason).toBe("non_positive_remainder");
  });

  it("is idempotent when run already exists", async () => {
    runFindUnique.mockResolvedValueOnce({ id: "run-existing", status: "applied" });

    const run = await executeMonthEndAutoTransferForUser({
      userId: "u1",
      monthStartISO: "2026-04-01",
      timezone: "UTC",
    });

    expect(txCreate).not.toHaveBeenCalled();
    expect(run).toEqual({ id: "run-existing", status: "applied" });
  });

  it("skips unavailable plan and continues valid allocations", async () => {
    savingsPlanFindMany.mockResolvedValueOnce([
      {
        id: "sp1",
        name: "Emergency",
        status: "cancelled",
        targetAmount: 500,
        transactions: [{ type: "income", amount: 200 }],
      },
      {
        id: "sp2",
        name: "Travel",
        status: "active",
        targetAmount: 2000,
        transactions: [],
      },
    ]);

    const run = await executeMonthEndAutoTransferForUser({
      userId: "u1",
      monthStartISO: "2026-04-01",
      timezone: "UTC",
    });

    expect(txCreate).toHaveBeenCalledTimes(1);
    expect(run.status).toBe("applied");
    const planResults = parsePlanResults(run.planResults);
    expect(planResults.find((item: { savingsPlanId: string }) => item.savingsPlanId === "sp1")?.status).toBe("skipped");
    expect(planResults.find((item: { savingsPlanId: string }) => item.savingsPlanId === "sp2")?.status).toBe("applied");
  });
});
