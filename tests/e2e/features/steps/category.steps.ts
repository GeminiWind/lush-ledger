import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { readE2ECategory, writeE2ECategory } from "../../helpers/e2e-category";
import { test } from "./scenario-fixtures";
import { actionButtonPattern } from "./step-helpers";

const { Given, When, Then } = createBdd(test);

// -- simple creation, no retry (create-category.feature) --

When("I create a category named {string} from the atelier", async ({ page, scenarioContext }, prefix: string) => {
  const name = `${prefix} ${Date.now()}`;
  scenarioContext.categoryName = name;

  await page.getByRole("button", { name: "Add New Category" }).click();
  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeVisible();

  await page.locator('input[name="name"]').fill(name);
  await page.locator('input[name="monthlyLimit"]').fill("0");

  const addCategoryButton = page.getByRole("button", { name: "Add Category" });
  await addCategoryButton.scrollIntoViewIfNeeded();
  await addCategoryButton.click();

  await expect(page.getByRole("heading", { name: "Create New Category" })).toBeHidden();
});

Then("the generated category heading should be visible", async ({ page, scenarioContext }) => {
  expect(scenarioContext.categoryName).toBeTruthy();
  await expect(page.getByRole("heading", { name: scenarioContext.categoryName! })).toBeVisible();
});

Then("my category should be saved for later scenarios", async ({ scenarioContext }) => {
  expect(scenarioContext.categoryName).toBeTruthy();
  await writeE2ECategory({ name: scenarioContext.categoryName! });
});

// -- retry-based creation with response wait (delete-category.feature) --

When(
  "I create a category named {string} in the atelier with retry",
  async ({ page, scenarioContext }, prefix: string) => {
    const name = `${prefix} ${Date.now()}`;
    scenarioContext.categoryName = name;

    await page.goto("/app/atelier");
    await expect(page.getByRole("heading", { name: "Budget Allocation" })).toBeVisible();

    await page.getByRole("button", { name: "Add New Category" }).click();
    await expect(page.getByRole("heading", { name: "Create New Category" })).toBeVisible();

    await page.locator('input[name="name"]').fill(name);
    await page.locator('input[name="monthlyLimit"]').fill("0");

    let createPayload: { category: { id: string } } | null = null;
    let lastFailureBody = "";

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const createResponsePromise = page.waitForResponse((response) => {
        return response.url().includes("/api/categories") && response.request().method() === "POST";
      });

      await page.getByRole("button", { name: "Add Category" }).click();
      const createResponse = await createResponsePromise;

      if (createResponse.status() === 200) {
        createPayload = (await createResponse.json()) as { category: { id: string } };
        break;
      }

      lastFailureBody = await createResponse.text();
      if (createResponse.status() < 500 || attempt === 3) {
        break;
      }

      await expect(page.getByRole("heading", { name: "Create New Category" })).toBeVisible();
      await page.waitForTimeout(250);
    }

    expect(createPayload, `Expected category creation to succeed; last response body: ${lastFailureBody}`).not.toBeNull();
    if (!createPayload) {
      throw new Error(`Category creation failed after retries: ${lastFailureBody}`);
    }
    scenarioContext.categoryId = createPayload.category.id;

    await expect(page.getByRole("heading", { name: "Create New Category" })).toBeHidden();
    await page.reload();
    await expect(page.getByRole("button", { name: actionButtonPattern("Delete", name) })).toBeVisible({
      timeout: 20_000,
    });
  },
);

When("I click the delete button for the generated category", async ({ page, scenarioContext }) => {
  expect(scenarioContext.categoryName).toBeTruthy();
  await page.getByRole("button", { name: actionButtonPattern("Delete", scenarioContext.categoryName!) }).click();
});

Then("the delete confirmation for the generated category should be visible", async ({ page, scenarioContext }) => {
  await expect(page.getByRole("heading", { name: `Delete Category: ${scenarioContext.categoryName}?` })).toBeVisible();
});

Then("the delete confirmation for the generated category should be hidden", async ({ page, scenarioContext }) => {
  await expect(page.getByRole("heading", { name: `Delete Category: ${scenarioContext.categoryName}?` })).toBeHidden();
});

When("I confirm the deletion", async ({ page }) => {
  await page.getByRole("button", { name: "Delete Category" }).click();
});

When("I cancel the deletion", async ({ page }) => {
  await page.getByRole("button", { name: "Keep Category" }).click();
});

Then("the generated category heading should be hidden", async ({ page, scenarioContext }) => {
  await expect(page.getByRole("heading", { name: scenarioContext.categoryName!, exact: true })).toBeHidden();
});

Then("the first generated category heading should be hidden", async ({ page, scenarioContext }) => {
  await expect(page.getByRole("heading", { name: scenarioContext.categoryName!, exact: true }).first()).toBeHidden();
});

When(
  "I create a ledger transaction with a unique generated note for the generated category via the API",
  async ({ page, scenarioContext }) => {
    expect(scenarioContext.categoryId).toBeTruthy();
    const note = `E2E-TX-${Date.now()}`;
    scenarioContext.ledgerNote = note;

    const nowIsoDate = new Date().toISOString().slice(0, 10);
    const status = await page.evaluate(
      async ({ targetCategoryId, date, notes }) => {
        const response = await fetch("/api/ledger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ categoryId: targetCategoryId, type: "expense", amount: 1, date, notes }),
        });
        return response.status;
      },
      { targetCategoryId: scenarioContext.categoryId!, date: nowIsoDate, notes: note },
    );
    expect(status).toBe(201);
  },
);

Then(
  "the ledger entry should be recategorized to {string}",
  async ({ page, scenarioContext }, expectedCategoryName: string) => {
    const ledgerBody = (await page.evaluate(async () => {
      const response = await fetch("/api/ledger");
      if (!response.ok) return { ledger: { transactions: [] } };
      return response.json();
    })) as { ledger: { transactions: Array<{ notes: string | null; category: { name: string } | null }> } };

    const movedTransaction = ledgerBody.ledger.transactions.find((t) => t.notes === scenarioContext.ledgerNote);
    expect(movedTransaction).toBeTruthy();
    expect(movedTransaction?.category?.name).toBe(expectedCategoryName);
  },
);

// -- update-category.feature: reads the category persisted by create-category.feature --

Given("a category exists from a previous scenario", async () => {
  const category = await readE2ECategory();
  expect(category.name.length).toBeGreaterThan(0);
});

When("I click the edit button for the previously created category", async ({ page }) => {
  const category = await readE2ECategory();
  await page.getByRole("button", { name: actionButtonPattern("Edit", category.name) }).click();
});

When("I fill {string} with the updated category name", async ({ page }, field: string) => {
  const category = await readE2ECategory();
  await page.locator(`input[name="${field}"]`).fill(`${category.name} Updated`);
});

Then("the updated category heading should be visible", async ({ page }) => {
  const category = await readE2ECategory();
  await expect(page.getByRole("heading", { name: `${category.name} Updated` })).toBeVisible();
});

Then("the edit button for the updated category should be visible", async ({ page }) => {
  const category = await readE2ECategory();
  await expect(
    page.getByRole("button", { name: actionButtonPattern("Edit", `${category.name} Updated`) }),
  ).toBeVisible();
});
