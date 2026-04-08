import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { readFileSync } from "node:fs";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/savings-auto-transfer", () => ({
  getAutoTransferRule: vi.fn(),
  updateAutoTransferRule: vi.fn(),
  getLatestAutoTransferRun: vi.fn(),
}));

vi.mock("@/lib/savings-auto-transfer-scheduler", () => ({
  startAutoTransferScheduler: vi.fn(),
}));

import { getSessionFromRequest } from "@/lib/auth";
import {
  getAutoTransferRule,
  getLatestAutoTransferRun,
  updateAutoTransferRule,
} from "@/lib/savings-auto-transfer";
import { GET as getRule, PUT as putRule } from "@/app/api/savings/auto-transfer/route";
import { GET as getLatestRun } from "@/app/api/savings/auto-transfer/latest-run/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedGetRule = vi.mocked(getAutoTransferRule);
const mockedUpdateRule = vi.mocked(updateAutoTransferRule);
const mockedGetLatestRun = vi.mocked(getLatestAutoTransferRun);

describe("Savings auto-transfer API contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    mockedGetRule.mockResolvedValue({
      enabled: true,
      allocations: [{ savingsPlanId: "sp1", percentage: 60 }],
      allocationTotalPercentage: 60,
      eligiblePlans: [{ id: "sp1", name: "Emergency", status: "active", remainingTargetAmount: 1200 }],
    });
    mockedUpdateRule.mockResolvedValue({
      ok: true,
      data: {
        enabled: true,
        allocations: [{ savingsPlanId: "sp1", percentage: 60 }],
        allocationTotalPercentage: 60,
        status: "saved",
      },
    });
    mockedGetLatestRun.mockResolvedValue({
      monthStart: "2026-04-01",
      timezone: "Asia/Ho_Chi_Minh",
      status: "applied",
      remainderAmount: 500,
      allocationTotalPercentage: 60,
      skipReason: null,
      planResults: [
        {
          savingsPlanId: "sp1",
          configuredPercentage: 60,
          calculatedAmount: 300,
          appliedAmount: 300,
          status: "applied",
          skipReason: null,
          transactionId: "tx1",
        },
      ],
    });
  });

  it("GET /api/savings/auto-transfer returns current rule", async () => {
    const response = await getRule(new NextRequest("http://localhost/api/savings/auto-transfer"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.enabled).toBe(true);
    expect(body.allocations).toEqual([{ savingsPlanId: "sp1", percentage: 60 }]);
    expect(body.allocationTotalPercentage).toBe(60);
  });

  it("PUT /api/savings/auto-transfer returns validation errors", async () => {
    mockedUpdateRule.mockResolvedValueOnce({
      ok: false,
      errors: {
        allocations: "At least one allocation is required",
      },
    });

    const response = await putRule(
      new NextRequest("http://localhost/api/savings/auto-transfer", {
        method: "PUT",
        body: JSON.stringify({ enabled: true, allocations: [] }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ errors: { allocations: "At least one allocation is required" } });
  });

  it("GET /api/savings/auto-transfer/latest-run returns latest run payload", async () => {
    const response = await getLatestRun(new NextRequest("http://localhost/api/savings/auto-transfer/latest-run"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.latestRun?.monthStart).toBe("2026-04-01");
    expect(body.latestRun?.planResults[0]?.transactionId).toBe("tx1");
  });

  it("requires auth for rule endpoint", async () => {
    mockedSession.mockResolvedValueOnce(null);

    const response = await getRule(new NextRequest("http://localhost/api/savings/auto-transfer"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ errors: { auth: "Unauthorized" } });
  });

  it("marks required fields with red (*) in auto-transfer settings UI", () => {
    const source = readFileSync("src/features/savings/components/auto-transfer-settings.tsx", "utf-8");
    expect(source).toContain("(*)");
  });
});
