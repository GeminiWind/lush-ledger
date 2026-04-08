import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/savings-auto-transfer-queue", () => ({
  enqueueAutoTransferJob: vi.fn(),
  startAutoTransferWorker: vi.fn(),
}));

import { prisma } from "@/lib/db";
import { enqueueAutoTransferJob } from "@/lib/savings-auto-transfer-queue";
import {
  enqueueDueAutoTransferJobs,
  hasCrossedLocalMonthBoundarySincePreviousRun,
  isSchedulerWindowUtc,
} from "@/lib/savings-auto-transfer-scheduler";

const userFindMany = prisma.user.findMany as unknown as ReturnType<typeof vi.fn>;
const enqueueJob = enqueueAutoTransferJob as unknown as ReturnType<typeof vi.fn>;

describe("auto-transfer scheduler boundary handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enqueueJob.mockResolvedValue({ id: "job-1" });
  });

  it("uses UTC window from day 27 through day 1", () => {
    expect(isSchedulerWindowUtc(new Date("2026-04-27T12:00:00.000Z"))).toBe(true);
    expect(isSchedulerWindowUtc(new Date("2026-04-28T12:00:00.000Z"))).toBe(true);
    expect(isSchedulerWindowUtc(new Date("2026-04-30T12:00:00.000Z"))).toBe(true);
    expect(isSchedulerWindowUtc(new Date("2026-05-01T12:00:00.000Z"))).toBe(true);
    expect(isSchedulerWindowUtc(new Date("2026-05-02T12:00:00.000Z"))).toBe(false);
  });

  it("detects month boundary crossing since previous daily run", () => {
    expect(
      hasCrossedLocalMonthBoundarySincePreviousRun("UTC", new Date("2026-05-01T12:00:00.000Z")),
    ).toBe(true);

    expect(
      hasCrossedLocalMonthBoundarySincePreviousRun("Pacific/Kiritimati", new Date("2026-05-01T12:00:00.000Z")),
    ).toBe(false);
  });

  it("enqueues only users whose local timezone crossed month-end in last run interval", async () => {
    userFindMany.mockResolvedValue([
      { id: "u-utc", settings: { timezone: "UTC" } },
      { id: "u-kiritimati", settings: { timezone: "Pacific/Kiritimati" } },
    ]);

    const result = await enqueueDueAutoTransferJobs(new Date("2026-04-30T12:00:00.000Z"));

    expect(result).toEqual({ enqueued: 1, checked: 2 });
    expect(enqueueJob).toHaveBeenCalledTimes(1);
    expect(enqueueJob).toHaveBeenCalledWith({
      userId: "u-kiritimati",
      monthStartISO: "2026-04-01",
      timezone: "Pacific/Kiritimati",
    });
  });

  it("skips db scan when outside UTC scheduler window", async () => {
    const result = await enqueueDueAutoTransferJobs(new Date("2026-05-02T12:00:00.000Z"));

    expect(result).toEqual({ enqueued: 0, checked: 0 });
    expect(userFindMany).not.toHaveBeenCalled();
    expect(enqueueJob).not.toHaveBeenCalled();
  });
});
