import { expect, test, type Page } from "@playwright/test";
import { readE2ECredentials } from "./helpers/e2e-credentials";

const loginWithStoredCredentials = async (page: Page) => {
  const credentials = await readE2ECredentials();

  expect(credentials.email.length).toBeGreaterThan(0);
  expect(credentials.password.length).toBeGreaterThan(0);

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/app(?:\?.*)?$/, { timeout: 20_000 });
};

test.describe("ledger date grouping smoke", () => {
  test("shows Today and Yesterday headers for mixed-date transactions", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1600 });
    await loginWithStoredCredentials(page);

    await page.goto("/app/ledger");
    await expect(page.getByRole("heading", { name: "The Ledger" }).first()).toBeVisible();

    const todayLabel = page.locator("h2 span").filter({ hasText: "Today" }).first();
    const yesterdayLabel = page.locator("h2 span").filter({ hasText: "Yesterday" }).first();

    await expect(todayLabel).toBeVisible();
    await expect(yesterdayLabel).toBeVisible();

    const isTodayBeforeYesterday = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("h2 span"));
      const todayIndex = sections.findIndex((node) => node.textContent?.trim() === "Today");
      const yesterdayIndex = sections.findIndex((node) => node.textContent?.trim() === "Yesterday");
      return todayIndex >= 0 && yesterdayIndex >= 0 && todayIndex < yesterdayIndex;
    });

    expect(isTodayBeforeYesterday).toBe(true);
  });
});
