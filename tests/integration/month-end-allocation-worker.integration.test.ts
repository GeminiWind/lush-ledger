import { beforeEach, describe, expect, it, vi } from "vitest";

const { workerCtor, waitUntilReady } = vi.hoisted(() => ({
  workerCtor: vi.fn(),
  waitUntilReady: vi.fn(),
}));

vi.mock("bullmq", () => ({
  Worker: workerCtor,
}));

vi.mock("@/lib/savings-remainder-allocation", () => ({
  executeSavingsRemainderAllocation: vi.fn(),
}));

vi.mock("@/lib/queue/connection", () => ({
  getQueueConnection: vi.fn(() => ({ connection: "redis" })),
}));

vi.mock("@/lib/queue/month-end-allocation-queue", () => ({
  MONTH_END_ALLOCATION_USER_JOB: "run-user-allocation",
  MONTH_END_ALLOCATION_USER_QUEUE: "month-end-allocation-user",
  getMonthEndAllocationQueueEvents: vi.fn(() => ({ waitUntilReady })),
}));

import { executeSavingsRemainderAllocation } from "@/lib/savings-remainder-allocation";
import { createMonthEndAllocationWorker, startMonthEndAllocationWorker } from "@/lib/queue/worker";

const mockedExecute = vi.mocked(executeSavingsRemainderAllocation);

describe("month-end allocation worker integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    waitUntilReady.mockResolvedValue(undefined);
    workerCtor.mockImplementation((queueName, processor, options) => ({
      queueName,
      processor,
      options,
    }));
    mockedExecute.mockResolvedValue({
      month: "2026-04",
      status: "applied",
      sourceRemainder: 100,
      totalTransferred: 100,
      unallocatedRemainder: 0,
      unallocatedReason: "none",
      transferTransactionType: "transfer_to_saving_plan",
      entries: [],
    });
  });

  it("processes per-user queue jobs through allocation service", async () => {
    const worker = createMonthEndAllocationWorker() as unknown as {
      processor: (job: { name: string; data: { userId: string; month: string; triggerSource: "replay"; replayReason?: string } }) => Promise<unknown>;
      options: { concurrency: number };
    };

    const result = await worker.processor({
      name: "run-user-allocation",
      data: {
        userId: "u1",
        month: "2026-04",
        triggerSource: "replay",
        replayReason: "retry_after_fix",
      },
    });

    expect(worker.options.concurrency).toBe(5);
    expect(mockedExecute).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "u1",
        trigger: "scheduled",
        triggerSource: "replay",
        replayReason: "retry_after_fix",
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        status: "applied",
        transferred: 100,
        triggerSource: "replay",
      }),
    );
  });

  it("starts queue events readiness when worker boots", async () => {
    const started = await startMonthEndAllocationWorker();

    expect(waitUntilReady).toHaveBeenCalledTimes(1);
    expect(started).toHaveProperty("worker");
    expect(started).toHaveProperty("events");
  });
});
