import { describe, expect, it } from "vitest";

import { evaluateAtelierListRowStatus, mapAtelierListRow } from "@/lib/atelier";

describe("atelier list foundational row mapper", () => {
  it("maps default row values for missing optional data", () => {
    const row = mapAtelierListRow({
      id: "cat_food",
      name: "Food",
    });

    expect(row).toEqual({
      id: "cat_food",
      name: "Food",
      icon: "category",
      limit: 0,
      spent: 0,
      usagePercent: 0,
      warningEnabled: true,
      warnAt: 80,
      carryNextMonth: false,
      status: "healthy",
    });
  });

  it("applies overspent precedence before warning", () => {
    const status = evaluateAtelierListRowStatus({
      limit: 100,
      spent: 130,
      warningEnabled: true,
      warnAt: 50,
      hasCompleteData: true,
    });

    expect(status).toBe("overspent");
  });

  it("maps warning status when spend reaches threshold", () => {
    const row = mapAtelierListRow({
      id: "cat_utilities",
      name: "Utilities",
      limit: 500,
      spent: 400,
      warningEnabled: true,
      warnAt: 80,
      carryNextMonth: true,
    });

    expect(row.status).toBe("warning");
    expect(row.usagePercent).toBe(80);
    expect(row.carryNextMonth).toBe(true);
  });

  it("maps pending status when data is partial", () => {
    const row = mapAtelierListRow({
      id: "cat_misc",
      name: "Misc",
      limit: 100,
      spent: 25,
      hasCompleteData: false,
    });

    expect(row.status).toBe("pending");
  });
});
