import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { escapeRegExp } from "./step-helpers";

const { Given, Then } = createBdd();

const toLocalISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

Given("two ledger transactions exist dated today and yesterday", async ({ page }) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const createTransaction = async (date: Date, notes: string) => {
    const status = await page.evaluate(
      async ({ isoDate, transactionNotes }) => {
        const response = await fetch("/api/ledger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "expense", amount: 1, date: isoDate, notes: transactionNotes }),
        });
        return response.status;
      },
      { isoDate: toLocalISODate(date), transactionNotes: notes },
    );
    expect(status).toBe(201);
  };

  await createTransaction(today, `E2E-Ledger-Today-${Date.now()}`);
  await createTransaction(yesterday, `E2E-Ledger-Yesterday-${Date.now()}`);
});

Then("I should be redirected to {string}", async ({ page }, path: string) => {
  await expect(page).toHaveURL(new RegExp(`${escapeRegExp(path)}(?:\\?.*)?$`), { timeout: 20_000 });
});

Then("the {string} checkbox should be checked", async ({ page }, label: string) => {
  await expect(page.getByRole("checkbox", { name: label })).toBeChecked();
});

Then("the form should be ready", async ({ page }) => {
  await expect(page.locator('form[data-client-ready="true"]')).toBeVisible();
});

Then("the {string} heading should be visible", async ({ page }, name: string) => {
  await expect(page.getByRole("heading", { name }).first()).toBeVisible();
});

Then("the {string} heading should be hidden", async ({ page }, name: string) => {
  await expect(page.getByRole("heading", { name }).first()).toBeHidden();
});

Then("I should see the text {string}", async ({ page }, text: string) => {
  await expect(page.getByText(text)).toBeVisible();
});

Then("the {string} date section should be visible", async ({ page }, label: string) => {
  await expect(page.locator("h2 span").filter({ hasText: label }).first()).toBeVisible();
});

Then(
  "the {string} date section should appear before the {string} date section",
  async ({ page }, first: string, second: string) => {
    const isFirstBeforeSecond = await page.evaluate(
      ({ firstLabel, secondLabel }) => {
        const sections = Array.from(document.querySelectorAll("h2 span"));
        const firstIndex = sections.findIndex((node) => node.textContent?.trim() === firstLabel);
        const secondIndex = sections.findIndex((node) => node.textContent?.trim() === secondLabel);
        return firstIndex >= 0 && secondIndex >= 0 && firstIndex < secondIndex;
      },
      { firstLabel: first, secondLabel: second },
    );
    expect(isFirstBeforeSecond).toBe(true);
  },
);
