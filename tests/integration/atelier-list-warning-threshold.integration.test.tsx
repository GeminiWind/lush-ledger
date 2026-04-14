import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CategoryAtelierGrid from "@/features/atelier/components/CategoryAtelierGrid";
import { mapAtelierListRows } from "@/features/atelier/list-view-model";

vi.mock("@/features/i18n/useNamespacedTranslation", () => ({
  useNamespacedTranslation: () => (key: string) => key,
}));

describe("atelier list warning threshold integration", () => {
  it("renders each category with its own warning threshold value", () => {
    const html = renderToStaticMarkup(
      <CategoryAtelierGrid
        categories={[
          {
            id: "cat_food",
            name: "Food",
            icon: "restaurant",
            limit: 5000000,
            spent: 3800000,
            usagePercent: 76,
            warningEnabled: true,
            warnAt: 75,
            carryNextMonth: true,
            status: "warning",
          },
          {
            id: "cat_rent",
            name: "Rent",
            icon: "home",
            limit: 12000000,
            spent: 9000000,
            usagePercent: 75,
            warningEnabled: true,
            warnAt: 90,
            carryNextMonth: false,
            status: "healthy",
          },
        ]}
        currency="VND"
        language="en-US"
        riskLabels={{
          healthy: "Within safe spend range",
          warning: "Approaching warning threshold",
          overspent: "Over monthly limit",
          pending: "Pending data",
        }}
        pendingLabel="Pending data"
      />,
    );

    expect(html).toContain("atelierWarnAt: <strong");
    expect(html).toContain("75%</strong> atelierWarnAtLimitContext");
    expect(html).toContain("90%</strong> atelierWarnAtLimitContext");
  });

  it("keeps month-specific threshold context after month refresh mapping", () => {
    const rowsForApril = mapAtelierListRows({
      categories: [{ id: "cat_food", name: "Food", icon: "restaurant" }],
      monthTransactions: [{ type: "expense", amount: 3000000, categoryId: "cat_food" }],
      monthLimits: [{ categoryId: "cat_food", limit: 5000000, warningEnabled: true, warnAt: 60 }],
      nextMonthLimits: [{ categoryId: "cat_food", limit: 5000000 }],
    });

    const rowsForMay = mapAtelierListRows({
      categories: [{ id: "cat_food", name: "Food", icon: "restaurant" }],
      monthTransactions: [{ type: "expense", amount: 3000000, categoryId: "cat_food" }],
      monthLimits: [{ categoryId: "cat_food", limit: 5000000, warningEnabled: true, warnAt: 85 }],
      nextMonthLimits: [{ categoryId: "cat_food", limit: 5000000 }],
    });

    const aprilHtml = renderToStaticMarkup(
      <CategoryAtelierGrid
        categories={rowsForApril}
        currency="VND"
        language="en-US"
        riskLabels={{
          healthy: "Within safe spend range",
          warning: "Approaching warning threshold",
          overspent: "Over monthly limit",
          pending: "Pending data",
        }}
        pendingLabel="Pending data"
      />,
    );

    const mayHtml = renderToStaticMarkup(
      <CategoryAtelierGrid
        categories={rowsForMay}
        currency="VND"
        language="en-US"
        riskLabels={{
          healthy: "Within safe spend range",
          warning: "Approaching warning threshold",
          overspent: "Over monthly limit",
          pending: "Pending data",
        }}
        pendingLabel="Pending data"
      />,
    );

    expect(aprilHtml).toContain("60%</strong> atelierWarnAtLimitContext");
    expect(aprilHtml).not.toContain("85%</strong> atelierWarnAtLimitContext");

    expect(mayHtml).toContain("85%</strong> atelierWarnAtLimitContext");
    expect(mayHtml).not.toContain("60%</strong> atelierWarnAtLimitContext");
  });
});
