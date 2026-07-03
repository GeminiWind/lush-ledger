import { createBdd } from "playwright-bdd";

const { Given, When } = createBdd();

Given("I am on the {string} page", async ({ page }, path: string) => {
  await page.goto(path);
});

Given("my viewport is set to {int}x{int}", async ({ page }, width: number, height: number) => {
  await page.setViewportSize({ width, height });
});

When("I wait for the page to finish loading", async ({ page }) => {
  await page.waitForLoadState("networkidle");
});
