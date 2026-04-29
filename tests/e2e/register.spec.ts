import { expect, test } from "@playwright/test";
import { writeE2ECredentials } from "./helpers/e2e-credentials";

const buildEmail = () => `e2e-register-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;

const password = "Aa!12345";
test("register redirects to app and stores credentials", async ({ page }) => {
  const email = buildEmail();

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create Your Atelier Account" })).toBeVisible();
  await page.waitForLoadState("networkidle");

  await page.locator('input[name="fullName"]').fill("E2E Register User");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.locator('input[name="acceptedTerms"]').check();

  await expect(page.locator('input[name="email"]')).toHaveValue(email);
  await expect(page.locator('input[name="acceptedTerms"]')).toBeChecked();
  await expect(page.locator('form[data-client-ready="true"]')).toBeVisible();

  await page.getByRole("button", { name: "Join the Atelier" }).click();
  await expect(page).toHaveURL(/\/app(?:\?.*)?$/, { timeout: 20_000 });

  await writeE2ECredentials({ email, password });
});
