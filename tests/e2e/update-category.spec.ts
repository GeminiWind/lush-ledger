import { expect, test, type Page } from "@playwright/test";
import { readE2ECategory } from "./helpers/e2e-category";
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

test("update category from atelier", async ({ page }) => {
  const createdCategory = await readE2ECategory();
  const updatedName = `${createdCategory.name} Updated`;

  expect(createdCategory.name.length).toBeGreaterThan(0);

  await page.setViewportSize({ width: 1440, height: 1600 });
  await loginWithStoredCredentials(page);

  await page.goto("/app/atelier");
  await expect(page.getByRole("heading", { name: "Budget Allocation" })).toBeVisible();

  await page.getByRole("button", { name: new RegExp(`Edit\\s+${createdCategory.name}`) }).click();
  await expect(page.getByRole("heading", { name: "Update Category" })).toBeVisible();

  await page.locator('input[name="name"]').fill(updatedName);
  await page.locator('input[name="monthlyLimit"]').fill("1");

  const updateCategoryButton = page.getByRole("button", { name: "Update Category" });
  await updateCategoryButton.scrollIntoViewIfNeeded();
  await updateCategoryButton.click();

  await expect(page.getByRole("heading", { name: "Update Category" })).toBeHidden();
  await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  await expect(page.getByRole("button", { name: new RegExp(`Edit\\s+${updatedName}`) })).toBeVisible();
});
