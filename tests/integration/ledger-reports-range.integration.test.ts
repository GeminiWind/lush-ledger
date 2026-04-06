import { describe, expect, it, vi } from "vitest";
import { addMonthsDate, monthKey, nowDate, startOfMonthDate } from "@/lib/date";

vi.mock("@/lib/db", () => ({
  prisma: {
    transaction: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    userMonthlyCap: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

vi.mock("@/lib/monthly-cap", () => ({
  ensureMonthlyCapSnapshot: vi.fn().mockResolvedValue({ totalCap: 0, totalLimit: 0 }),
}));

vi.mock("@/lib/recurring", () => ({
  materializeRecurringTransactions: vi.fn().mockResolvedValue(undefined),
}));

import { getLedgerReportsData } from "@/lib/ledger";

describe("ledger reports month/year options", () => {
  it("returns at least a rolling three-year month range with no historical data", async () => {
    const result = await getLedgerReportsData("user-1");
    const expectedFirstMonth = monthKey(startOfMonthDate(addMonthsDate(nowDate(), -35)));

    expect(result.monthlySeries.length).toBeGreaterThanOrEqual(36);
    expect(result.monthlySeries[0]?.key).toBe(expectedFirstMonth);
    expect(result.bounds.firstMonthKey).toBe(expectedFirstMonth);
    expect(result.yearlySeries.length).toBeGreaterThanOrEqual(3);
  });
});
