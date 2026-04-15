import { describe, expect, it, vi } from "vitest";
import {
  buildAtelierMonthHref,
  createAtelierMonthOptions,
  mapAtelierListRows,
  parseAtelierMonthParam,
} from "@/features/atelier/list-view-model";
import { DateTime } from "luxon";
import { dismissEditModalFromBackdrop } from "@/features/atelier/dialogs/EditCategoryModal";
import { updateCategoryWithParsedError } from "@/features/atelier/services";

describe("atelier list integration", () => {
  it("maps month-scoped payload rows with required attributes", () => {
    const rows = mapAtelierListRows({
      categories: [
        { id: "cat_food", name: "Food", icon: "restaurant" },
        { id: "cat_misc", name: "Misc", icon: null },
      ],
      monthTransactions: [
        { type: "expense", amount: 4200000, categoryId: "cat_food" },
        { type: "income", amount: 5000000, categoryId: null },
      ],
      monthLimits: [
        { categoryId: "cat_food", limit: 5000000, warningEnabled: true, warnAt: 80 },
      ],
      nextMonthLimits: [
        { categoryId: "cat_food", limit: 5000000 },
      ],
    });

    expect(rows).toHaveLength(2);

    expect(rows[0]).toEqual({
      id: "cat_food",
      name: "Food",
      icon: "restaurant",
      limit: 5000000,
      spent: 4200000,
      usagePercent: 84,
      warningEnabled: true,
      warnAt: 80,
      carryNextMonth: true,
      status: "warning",
    });

    expect(rows[1]).toEqual({
      id: "cat_misc",
      name: "Misc",
      icon: "category",
      limit: 0,
      spent: 0,
      usagePercent: 0,
      warningEnabled: true,
      warnAt: 80,
      carryNextMonth: false,
      status: "pending",
    });
  });

  it("builds month-switch href while preserving existing query params", () => {
    const href = buildAtelierMonthHref("/app/atelier", "tab=overview&foo=bar", "2026-05");
    const parsed = new URL(`https://example.com${href}`);

    expect(parsed.pathname).toBe("/app/atelier");
    expect(parsed.searchParams.get("tab")).toBe("overview");
    expect(parsed.searchParams.get("foo")).toBe("bar");
    expect(parsed.searchParams.get("month")).toBe("2026-05");
  });

  it("validates month query using YYYY-MM", () => {
    expect(parseAtelierMonthParam("2026-04", "UTC")?.toFormat("yyyy-MM")).toBe("2026-04");
    expect(parseAtelierMonthParam("2026-4", "UTC")).toBeNull();
  });

  it("keeps current month selectable after selecting older month", () => {
    const options = createAtelierMonthOptions({
      currentMonth: DateTime.fromISO("2026-04-01", { zone: "UTC" }),
      selectedMonth: DateTime.fromISO("2026-01-01", { zone: "UTC" }),
    });

    expect(options[0]).toBe("2026-04");
    expect(options).toContain("2026-01");
  });

  it("includes selected month even when outside default window", () => {
    const options = createAtelierMonthOptions({
      currentMonth: DateTime.fromISO("2026-04-01", { zone: "UTC" }),
      selectedMonth: DateTime.fromISO("2024-01-01", { zone: "UTC" }),
    });

    expect(options).toContain("2024-01");
  });

  it("does not send PATCH when edit flow is dismissed from backdrop", () => {
    const closeModal = vi.fn();
    const updateCategoryMutationMock = vi.spyOn(
      { updateCategoryWithParsedError },
      "updateCategoryWithParsedError",
    );

    dismissEditModalFromBackdrop(closeModal);

    expect(closeModal).toHaveBeenCalledTimes(1);
    expect(updateCategoryMutationMock).not.toHaveBeenCalled();

    updateCategoryMutationMock.mockRestore();
  });
});
