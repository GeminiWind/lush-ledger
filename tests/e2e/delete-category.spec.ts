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

const createCategoryFromUi = async (page: Page, categoryName: string) => {
  await page.goto("/app/atelier");
  await expect(page.getByRole("heading", { name: "Budget Allocation" })).toBeVisible();

  await page.getByRole("button", { name: "Add New Category" }).click();
  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeVisible();

  await page.locator('input[name="name"]').fill(categoryName);
  await page.locator('input[name="monthlyLimit"]').fill("0");
  const createResponsePromise = page.waitForResponse((response) => {
    return response.url().includes("/api/categories") && response.request().method() === "POST";
  });
  await page.getByRole("button", { name: "Add Category" }).click();
  const createResponse = await createResponsePromise;
  expect(createResponse.status()).toBe(200);
  const createPayload = (await createResponse.json()) as { category: { id: string } };

  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeHidden();
  await page.reload();
  await expect(page.getByRole("button", { name: new RegExp(`Delete\\s+${categoryName}`) })).toBeVisible({ timeout: 20_000 });

  return createPayload.category.id;
};

test("delete success removes category from active atelier list", async ({ page }) => {
  const categoryName = `E2E Delete ${Date.now()}`;

  await page.setViewportSize({ width: 1440, height: 1600 });
  await loginWithStoredCredentials(page);
  await createCategoryFromUi(page, categoryName);

  await page.getByRole("button", { name: new RegExp(`Delete\\s+${categoryName}`) }).click();
  await expect(page.getByRole("heading", { name: `Delete Category: ${categoryName}?` })).toBeVisible();

  await page.getByRole("button", { name: "Delete Category" }).click();
  await expect(page.getByRole("heading", { name: `Delete Category: ${categoryName}?` })).toBeHidden();
  await expect(page.getByRole("heading", { name: categoryName, exact: true })).toBeHidden();
});

test("delete cancel keeps category unchanged", async ({ page }) => {
  const categoryName = `E2E Keep ${Date.now()}`;

  await page.setViewportSize({ width: 1440, height: 1600 });
  await loginWithStoredCredentials(page);
  await createCategoryFromUi(page, categoryName);

  await page.getByRole("button", { name: new RegExp(`Delete\\s+${categoryName}`) }).click();
  await expect(page.getByRole("heading", { name: `Delete Category: ${categoryName}?` })).toBeVisible();

  await page.getByRole("button", { name: "Keep Category" }).click();
  await expect(page.getByRole("heading", { name: `Delete Category: ${categoryName}?` })).toBeHidden();
  await expect(page.getByRole("heading", { name: categoryName })).toBeVisible();
});

test("delete in-use category preserves ledger entry via Uncategorized", async ({ page }) => {
  const categoryName = `E2E InUse ${Date.now()}`;
  const txNote = `E2E-TX-${Date.now()}`;

  await page.setViewportSize({ width: 1440, height: 1600 });
  await loginWithStoredCredentials(page);
  const categoryId = await createCategoryFromUi(page, categoryName);

  expect(categoryId.length).toBeGreaterThan(0);

  const nowIsoDate = new Date().toISOString().slice(0, 10);
  const createLedgerStatus = await page.evaluate(
    async ({ targetCategoryId, date, note }) => {
      const response = await fetch("/api/ledger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: targetCategoryId,
          type: "expense",
          amount: 1,
          date,
          notes: note,
        }),
      });

      return response.status;
    },
    { targetCategoryId: categoryId, date: nowIsoDate, note: txNote },
  );
  expect(createLedgerStatus).toBe(201);

  await page.goto("/app/atelier");
  await page.getByRole("button", { name: new RegExp(`Delete\\s+${categoryName}`) }).click();
  await page.getByRole("button", { name: "Delete Category" }).click();
  await expect(page.getByRole("heading", { name: categoryName, exact: true }).first()).toBeHidden();

  const ledgerBody = (await page.evaluate(async () => {
    const response = await fetch("/api/ledger");
    if (!response.ok) {
      return { ledger: { transactions: [] } };
    }

    return response.json();
  })) as {
    ledger: { transactions: Array<{ notes: string | null; category: { name: string } | null }> };
  };

  const movedTransaction = ledgerBody.ledger.transactions.find((transaction) => transaction.notes === txNote);
  expect(movedTransaction).toBeTruthy();
  expect(movedTransaction?.category?.name).toBe("Uncategorized");
});
