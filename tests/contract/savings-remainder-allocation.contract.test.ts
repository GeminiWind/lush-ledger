import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/auth", () => ({
  getSessionFromRequest: vi.fn(),
}));

vi.mock("@/lib/savings-remainder-allocation", () => ({
  getSavingsRemainderAllocationSummary: vi.fn(),
  executeSavingsRemainderAllocation: vi.fn(),
}));

import { getSessionFromRequest } from "@/lib/auth";
import {
  executeSavingsRemainderAllocation,
  getSavingsRemainderAllocationSummary,
} from "@/lib/savings-remainder-allocation";
import { GET, POST } from "@/app/api/savings/remainder-allocation/route";

const mockedSession = vi.mocked(getSessionFromRequest);
const mockedSummary = vi.mocked(getSavingsRemainderAllocationSummary);
const mockedExecute = vi.mocked(executeSavingsRemainderAllocation);

describe("savings remainder allocation contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedSession.mockResolvedValue({ sub: "u1", email: "u1@example.com" });
    mockedSummary.mockResolvedValue({
      month: "2026-04",
      totalCap: 1200,
      totalLimit: 900,
      isVisible: true,
      reason: "eligible_cap_above_limits",
      latestRun: null,
    });
    mockedExecute.mockResolvedValue({
      month: "2026-04",
      status: "applied",
      sourceRemainder: 300,
      totalTransferred: 300,
      unallocatedRemainder: 0,
      unallocatedReason: "none",
      transferTransactionType: "transfer_to_saving_plan",
      entries: [],
    });
  });

  it("returns 401 for GET without session", async () => {
    mockedSession.mockResolvedValue(null);

    const response = await GET(new NextRequest("http://localhost/api/savings/remainder-allocation"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 for GET with invalid month", async () => {
    const response = await GET(new NextRequest("http://localhost/api/savings/remainder-allocation?month=2026-99"));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "month must be in YYYY-MM format." });
  });

  it("returns eligibility payload for GET", async () => {
    const response = await GET(new NextRequest("http://localhost/api/savings/remainder-allocation?month=2026-04"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.isVisible).toBe(true);
    expect(body.reason).toBe("eligible_cap_above_limits");
    expect(mockedSummary).toHaveBeenCalled();
  });

  it("returns latest run summary payload for GET when available", async () => {
    mockedSummary.mockResolvedValueOnce({
      month: "2026-04",
      totalCap: 1200,
      totalLimit: 900,
      isVisible: true,
      reason: "eligible_cap_above_limits",
      latestRun: {
        month: "2026-04",
        status: "applied",
        sourceRemainder: 300,
        totalTransferred: 250,
        unallocatedRemainder: 50,
        unallocatedReason: "exceeds_eligible_need",
        transferTransactionType: "transfer_to_saving_plan",
        entries: [
          {
            savingsPlanId: "plan-home",
            priorityPercent: 60,
            plannedAmount: 180,
            appliedAmount: 180,
            result: "applied",
            transactionId: "tx_1",
            allocationRunKey: "u1:2026-04",
          },
        ],
      },
    });

    const response = await GET(new NextRequest("http://localhost/api/savings/remainder-allocation?month=2026-04"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.latestRun?.unallocatedReason).toBe("exceeds_eligible_need");
    expect(body.latestRun?.entries?.[0]?.transactionId).toBe("tx_1");
    expect(body.latestRun?.entries?.[0]?.allocationRunKey).toBe("u1:2026-04");
  });

  it("returns 401 for POST without session", async () => {
    mockedSession.mockResolvedValue(null);

    const response = await POST(
      new NextRequest("http://localhost/api/savings/remainder-allocation", {
        method: "POST",
        body: JSON.stringify({ month: "2026-04" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("returns 400 for POST with invalid month", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/savings/remainder-allocation", {
        method: "POST",
        body: JSON.stringify({ month: "2026-00" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "month must be in YYYY-MM format." });
  });

  it("returns applied response for POST", async () => {
    const response = await POST(
      new NextRequest("http://localhost/api/savings/remainder-allocation", {
        method: "POST",
        body: JSON.stringify({ month: "2026-04" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("applied");
    expect(body.unallocatedReason).toBe("none");
    expect(body.transferTransactionType).toBe("transfer_to_saving_plan");
    expect(mockedExecute).toHaveBeenCalled();
  });

  it("returns no-op zero remainder payload for POST", async () => {
    mockedExecute.mockResolvedValueOnce({
      month: "2026-04",
      status: "no_op_zero_remainder",
      sourceRemainder: 0,
      totalTransferred: 0,
      unallocatedRemainder: 0,
      unallocatedReason: "zero_remainder",
      transferTransactionType: "transfer_to_saving_plan",
      entries: [],
    });

    const response = await POST(
      new NextRequest("http://localhost/api/savings/remainder-allocation", {
        method: "POST",
        body: JSON.stringify({ month: "2026-04" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("no_op_zero_remainder");
    expect(body.unallocatedReason).toBe("zero_remainder");
    expect(body.totalTransferred).toBe(0);
  });
});
