import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/savings-remainder-allocation", () => ({
  runScheduledMonthEndRemainderAllocation: vi.fn(),
}));

vi.mock("@/lib/queue/producer", () => ({
  enqueueMonthEndAllocationJobs: vi.fn(),
  enqueueUserMonthReplayJob: vi.fn(),
}));

import { runScheduledMonthEndRemainderAllocation } from "@/lib/savings-remainder-allocation";
import { enqueueMonthEndAllocationJobs, enqueueUserMonthReplayJob } from "@/lib/queue/producer";
import { GET } from "@/app/api/internal/jobs/month-end-remainder-allocation/route";
import { POST as replayPOST } from "@/app/api/internal/jobs/month-end-remainder-allocation/replay/route";

const mockedRunScheduled = vi.mocked(runScheduledMonthEndRemainderAllocation);
const mockedEnqueueMonth = vi.mocked(enqueueMonthEndAllocationJobs);
const mockedReplay = vi.mocked(enqueueUserMonthReplayJob);

describe("month-end allocation queue contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INTERNAL_JOB_SECRET = "test-secret";

    mockedRunScheduled.mockResolvedValue({
      processedMonth: "2026-04",
      queuedUsers: 3,
      duplicateJobs: 0,
    });

    mockedEnqueueMonth.mockResolvedValue({
      month: "2026-04",
      queuedUsers: 3,
      duplicateJobs: 0,
    });

    mockedReplay.mockResolvedValue({
      userId: "u1",
      month: "2026-04",
      enqueued: true,
    });
  });

  it("returns 401 for cron GET without valid internal auth", async () => {
    const response = await GET(new NextRequest("http://localhost/api/internal/jobs/month-end-remainder-allocation"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });

  it("accepts cron header auth and triggers scheduled enqueue flow", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/internal/jobs/month-end-remainder-allocation", {
        headers: {
          "x-vercel-cron": "55 23 * * *",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.queuedUsers).toBe(3);
    expect(mockedRunScheduled).toHaveBeenCalled();
  });

  it("returns 400 when GET month is invalid", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/internal/jobs/month-end-remainder-allocation?month=2026-99", {
        headers: {
          "x-internal-job-key": "test-secret",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({ error: "month must be in YYYY-MM format." });
  });

  it("enqueues explicit month when month query is provided", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/internal/jobs/month-end-remainder-allocation?month=2026-04", {
        headers: {
          "x-internal-job-key": "test-secret",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.month).toBe("2026-04");
    expect(mockedEnqueueMonth).toHaveBeenCalledWith(
      expect.objectContaining({
        triggerSource: "cron",
      }),
    );
  });

  it("returns 401 for replay endpoint without key", async () => {
    const response = await replayPOST(
      new NextRequest("http://localhost/api/internal/jobs/month-end-remainder-allocation/replay", {
        method: "POST",
        body: JSON.stringify({ userId: "u1", month: "2026-04" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("returns 400 for replay endpoint invalid payload", async () => {
    const response = await replayPOST(
      new NextRequest("http://localhost/api/internal/jobs/month-end-remainder-allocation/replay", {
        method: "POST",
        headers: {
          "x-internal-job-key": "test-secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({ userId: "u1", month: "2026-14" }),
      }),
    );

    expect(response.status).toBe(400);
  });

  it("enqueues replay job for valid payload", async () => {
    const response = await replayPOST(
      new NextRequest("http://localhost/api/internal/jobs/month-end-remainder-allocation/replay", {
        method: "POST",
        headers: {
          "x-internal-job-key": "test-secret",
          "content-type": "application/json",
        },
        body: JSON.stringify({ userId: "u1", month: "2026-04", reason: "retry_after_fix" }),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.enqueued).toBe(true);
    expect(mockedReplay).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        reason: "retry_after_fix",
      }),
    );
  });
});
