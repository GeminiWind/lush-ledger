import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CategoryAtelierGrid from "@/features/atelier/components/CategoryAtelierGrid";

vi.mock("@/features/i18n/useNamespacedTranslation", () => ({
  useNamespacedTranslation: () => (key: string) => key,
}));

describe("atelier list risk ui integration", () => {
  it("renders status labels with iconography (not color-only)", () => {
    const html = renderToStaticMarkup(
      <CategoryAtelierGrid
        categories={[
          {
            id: "cat_warning",
            name: "Food",
            icon: "restaurant",
            limit: 5000000,
            spent: 4200000,
            usagePercent: 84,
            warningEnabled: true,
            warnAt: 80,
            carryNextMonth: true,
            status: "warning",
          },
          {
            id: "cat_overspent",
            name: "Shopping",
            icon: "storefront",
            limit: 1800000,
            spent: 2200000,
            usagePercent: 100,
            warningEnabled: true,
            warnAt: 75,
            carryNextMonth: false,
            status: "overspent",
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

    expect(html).toContain("Approaching warning threshold");
    expect(html).toContain("Over monthly limit");
    expect(html).toContain("warning");
    expect(html).toContain("error");
    expect(html).toContain('aria-label="Food Approaching warning threshold"');
    expect(html).toContain('aria-label="Shopping Over monthly limit"');
  });

  it("renders explicit pending data row status", () => {
    const html = renderToStaticMarkup(
      <CategoryAtelierGrid
        categories={[
          {
            id: "cat_pending",
            name: "Misc",
            icon: "category",
            limit: 0,
            spent: 0,
            usagePercent: 0,
            warningEnabled: true,
            warnAt: 80,
            carryNextMonth: false,
            status: "pending",
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

    expect(html).toContain("Pending data");
    expect(html).toContain("hourglass_top");
    expect(html).toContain('aria-label="Misc Pending data"');
  });
});
