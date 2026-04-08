import { describe, expect, it } from "vitest";
import {
  buildAutoAllocationAuditMetadata,
  computeRemainderAllocationEntries,
  parseAutoAllocationAuditMetadata,
  selectEligibleSavingsPlans,
} from "@/lib/savings-remainder-allocation";

const toCents = (value: number) => Math.round(value * 100);

describe("savings remainder allocation integration behavior", () => {
  it("returns no transfers when source remainder is zero", () => {
    const entries = computeRemainderAllocationEntries(0, [
      { id: "p1", priorityPercent: 50, remainingNeed: 200 },
      { id: "p2", priorityPercent: 50, remainingNeed: 200 },
    ]);

    expect(entries.totalTransferred).toBe(0);
    expect(entries.unallocatedRemainder).toBe(0);
    expect(entries.entries.every((entry) => entry.appliedAmount === 0)).toBe(true);
  });

  it("splits positive remainder by priority percentages", () => {
    const result = computeRemainderAllocationEntries(100, [
      { id: "p1", priorityPercent: 60, remainingNeed: 1000 },
      { id: "p2", priorityPercent: 40, remainingNeed: 1000 },
    ]);

    const p1 = result.entries.find((entry) => entry.savingsPlanId === "p1");
    const p2 = result.entries.find((entry) => entry.savingsPlanId === "p2");

    expect(p1?.appliedAmount).toBeCloseTo(60, 2);
    expect(p2?.appliedAmount).toBeCloseTo(40, 2);
    expect(result.totalTransferred).toBeCloseTo(100, 2);
    expect(result.unallocatedRemainder).toBeCloseTo(0, 2);
  });

  it("caps per-plan transfers and keeps excess remainder unchanged", () => {
    const result = computeRemainderAllocationEntries(250, [
      { id: "p1", priorityPercent: 70, remainingNeed: 50 },
      { id: "p2", priorityPercent: 30, remainingNeed: 40 },
    ]);

    const p1 = result.entries.find((entry) => entry.savingsPlanId === "p1");
    const p2 = result.entries.find((entry) => entry.savingsPlanId === "p2");

    expect(p1?.appliedAmount).toBeCloseTo(50, 2);
    expect(p2?.appliedAmount).toBeCloseTo(40, 2);
    expect(result.totalTransferred).toBeCloseTo(90, 2);
    expect(result.unallocatedRemainder).toBeCloseTo(160, 2);
  });

  it("reconciles exactly after deterministic cent-level rounding", () => {
    const sourceRemainder = 10.01;
    const result = computeRemainderAllocationEntries(sourceRemainder, [
      { id: "p1", priorityPercent: 33.33, remainingNeed: 1000 },
      { id: "p2", priorityPercent: 33.33, remainingNeed: 1000 },
      { id: "p3", priorityPercent: 33.34, remainingNeed: 1000 },
    ]);

    const reconciliationCents = toCents(result.totalTransferred) + toCents(result.unallocatedRemainder);
    expect(reconciliationCents).toBe(toCents(sourceRemainder));
  });

  it("filters to eligible active and funded plans by status and remaining need", () => {
    const eligible = selectEligibleSavingsPlans([
      {
        id: "active-with-need",
        status: "active",
        monthlyContribution: 300,
        targetAmount: 1000,
        savedAmount: 200,
      },
      {
        id: "funded-with-need",
        status: "funded",
        monthlyContribution: 200,
        targetAmount: 1200,
        savedAmount: 1100,
      },
      {
        id: "active-complete",
        status: "active",
        monthlyContribution: 200,
        targetAmount: 500,
        savedAmount: 500,
      },
      {
        id: "cancelled",
        status: "cancelled",
        monthlyContribution: 500,
        targetAmount: 1200,
        savedAmount: 100,
      },
    ]);

    expect(eligible).toHaveLength(2);
    expect(eligible.find((item) => item.id === "active-with-need")?.priorityPercent).toBeCloseTo(60, 2);
    expect(eligible.find((item) => item.id === "funded-with-need")?.priorityPercent).toBeCloseTo(40, 2);
  });

  it("builds and parses allocation audit metadata for transaction traceability", () => {
    const note = buildAutoAllocationAuditMetadata({
      noteTag: "AUTO_MONTH_END_ALLOCATION:2026-04",
      runKey: "u1:2026-04",
      month: "2026-04",
      savingsPlanId: "plan-home",
      priorityPercent: 60,
      appliedAmount: 180.5,
      triggerSource: "replay",
      replayReason: "retry_after_fix",
    });

    const parsed = parseAutoAllocationAuditMetadata(note);

    expect(parsed.runKey).toBe("u1:2026-04");
    expect(parsed.month).toBe("2026-04");
    expect(parsed.savingsPlanId).toBe("plan-home");
    expect(parsed.appliedAmount).toBe("180.50");
    expect(parsed.priorityPercent).toBe("60.00");
    expect(parsed.triggerSource).toBe("replay");
    expect(parsed.replayReason).toBe("retry_after_fix");
  });
});
