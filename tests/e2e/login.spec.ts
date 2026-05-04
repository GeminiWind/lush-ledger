import { expect, test } from "@playwright/test";
import { readE2ECredentials } from "./helpers/e2e-credentials";

test("login redirects to app", async ({ page }) => {
  const credentials = await readE2ECredentials();

  expect(credentials.email.length).toBeGreaterThan(0);
  expect(credentials.password.length).toBeGreaterThan(0);

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back to the Atelier" })).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.locator('input[name="remember"]').check();

  await expect(page.locator('input[name="email"]')).toHaveValue(credentials.email);
  await expect(page.locator('input[name="remember"]')).toBeChecked();
  await expect(page.locator('form[data-client-ready="true"]')).toBeVisible();

  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/app(?:\?.*)?$/, { timeout: 20_000 });
});
