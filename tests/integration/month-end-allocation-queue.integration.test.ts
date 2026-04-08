import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/queue/month-end-allocation-queue", () => ({
  getMonthEndAllocationUserQueue: vi.fn(),
  MONTH_END_ALLOCATION_USER_JOB: "run-user-allocation",
  toMonthEndAllocationJobId: (userId: string, month: string) => `allocation:${month}:${userId}`,
}));

import { prisma } from "@/lib/db";
import { getMonthEndAllocationUserQueue } from "@/lib/queue/month-end-allocation-queue";
import { enqueueMonthEndAllocationJobs } from "@/lib/queue/producer";

const mockedFindMany = vi.mocked(prisma.user.findMany);
const mockedGetQueue = vi.mocked(getMonthEndAllocationUserQueue);

describe("month-end allocation queue producer integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fans out jobs in batches with deterministic per-user job IDs", async () => {
    const add = vi.fn().mockResolvedValue(undefined);
    mockedGetQueue.mockReturnValue({ add } as never);

    mockedFindMany
      .mockResolvedValueOnce([{ id: "u1" }, { id: "u2" }] as never)
      .mockResolvedValueOnce([{ id: "u3" }] as never)
      .mockResolvedValueOnce([] as never);

    const result = await enqueueMonthEndAllocationJobs({
      monthStart: new Date("2026-04-15T00:00:00.000Z"),
      triggerSource: "cron",
      batchSize: 2,
    });

    expect(result.month).toBe("2026-04");
    expect(result.queuedUsers).toBe(3);
    expect(result.duplicateJobs).toBe(0);

    expect(add).toHaveBeenCalledTimes(3);
    expect(add).toHaveBeenNthCalledWith(
      1,
      "run-user-allocation",
      expect.objectContaining({ userId: "u1", month: "2026-04", triggerSource: "cron" }),
      expect.objectContaining({ jobId: "allocation:2026-04:u1" }),
    );
    expect(add).toHaveBeenNthCalledWith(
      2,
      "run-user-allocation",
      expect.objectContaining({ userId: "u2", month: "2026-04", triggerSource: "cron" }),
      expect.objectContaining({ jobId: "allocation:2026-04:u2" }),
    );
    expect(add).toHaveBeenNthCalledWith(
      3,
      "run-user-allocation",
      expect.objectContaining({ userId: "u3", month: "2026-04", triggerSource: "cron" }),
      expect.objectContaining({ jobId: "allocation:2026-04:u3" }),
    );
  });

  it("counts duplicate jobId errors without failing entire enqueue pass", async () => {
    const add = vi
      .fn()
      .mockRejectedValueOnce(new Error("JobId already exists"))
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined);
    mockedGetQueue.mockReturnValue({ add } as never);

    mockedFindMany
      .mockResolvedValueOnce([{ id: "u1" }, { id: "u2" }] as never)
      .mockResolvedValueOnce([{ id: "u3" }] as never)
      .mockResolvedValueOnce([] as never);

    const result = await enqueueMonthEndAllocationJobs({
      monthStart: new Date("2026-04-15T00:00:00.000Z"),
      triggerSource: "cron",
      batchSize: 2,
    });

    expect(result.queuedUsers).toBe(2);
    expect(result.duplicateJobs).toBe(1);
  });
});
