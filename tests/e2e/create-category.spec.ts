import { expect, test, type Page } from "@playwright/test";
import { writeE2ECategory } from "./helpers/e2e-category";
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

test("create category from atelier", async ({ page }) => {
  const categoryName = `E2E Category ${Date.now()}`;

  await page.setViewportSize({ width: 1440, height: 1600 });

  await loginWithStoredCredentials(page);

  await page.goto("/app/atelier");
  await expect(page.getByRole("heading", { name: "Budget Allocation" })).toBeVisible();

  await page.getByRole("button", { name: "Add New Category" }).click();
  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeVisible();

  await page.locator('input[name="name"]').fill(categoryName);
  await page.locator('input[name="monthlyLimit"]').fill("0");

  const addCategoryButton = page.getByRole("button", { name: "Add Category" });
  await addCategoryButton.scrollIntoViewIfNeeded();
  await addCategoryButton.click();

  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeHidden();
  await expect(page.getByRole("heading", { name: categoryName })).toBeVisible();

  await writeE2ECategory({ name: categoryName });
});

test("create category shows validation errors for invalid input", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1600 });
  await loginWithStoredCredentials(page);

  await page.goto("/app/atelier");
  await expect(page.getByRole("heading", { name: "Budget Allocation" })).toBeVisible();

  await page.getByRole("button", { name: "Add New Category" }).click();
  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeVisible();

  await page.locator('input[name="name"]').fill("");
  await page.locator('input[name="monthlyLimit"]').fill("");

  const addCategoryButton = page.getByRole("button", { name: "Add Category" });
  await addCategoryButton.scrollIntoViewIfNeeded();
  await addCategoryButton.click();

  await expect(page.getByText("Category name is required.")).toBeVisible();
  await expect(page.getByText("Monthly limit is required.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeVisible();
});

test("unauthorized user is redirected to login", async ({ page }) => {
  await page.goto("/app/atelier");

  await expect(page).toHaveURL(/\/login(?:\?.*)?$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { name: "Welcome Back to the Atelier" })).toBeVisible();
});
