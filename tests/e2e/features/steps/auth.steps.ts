import { expect } from "@playwright/test";
import { createBdd } from "playwright-bdd";
import { readE2ECredentials, writeE2ECredentials } from "../../helpers/e2e-credentials";
import { test } from "./scenario-fixtures";
import { buildUniqueEmail, REGISTER_PASSWORD } from "./step-helpers";

const { Given, When, Then } = createBdd(test);

When("I fill {string} with a unique generated email", async ({ page, scenarioContext }, field: string) => {
  const email = buildUniqueEmail();
  scenarioContext.generatedEmail = email;
  await page.locator(`input[name="${field}"]`).fill(email);
});

Then(
  "the {string} field should have the generated email as its value",
  async ({ page, scenarioContext }, field: string) => {
    expect(scenarioContext.generatedEmail).toBeTruthy();
    await expect(page.locator(`input[name="${field}"]`)).toHaveValue(scenarioContext.generatedEmail!);
  },
);

Then("my credentials should be saved for later scenarios", async ({ scenarioContext }) => {
  expect(scenarioContext.generatedEmail).toBeTruthy();
  await writeE2ECredentials({ email: scenarioContext.generatedEmail!, password: REGISTER_PASSWORD });
});

Given("a registered user exists", async () => {
  const credentials = await readE2ECredentials();
  expect(credentials.email.length).toBeGreaterThan(0);
  expect(credentials.password.length).toBeGreaterThan(0);
});

When("I fill {string} with the registered user's email", async ({ page }, field: string) => {
  const credentials = await readE2ECredentials();
  await page.locator(`input[name="${field}"]`).fill(credentials.email);
});

When("I fill {string} with the registered user's password", async ({ page }, field: string) => {
  const credentials = await readE2ECredentials();
  await page.locator(`input[name="${field}"]`).fill(credentials.password);
});

Then(
  "the {string} field should have the registered user's email as its value",
  async ({ page }, field: string) => {
    const credentials = await readE2ECredentials();
    await expect(page.locator(`input[name="${field}"]`)).toHaveValue(credentials.email);
  },
);

Given("I am logged in", async ({ page }) => {
  const credentials = await readE2ECredentials();
  expect(credentials.email.length).toBeGreaterThan(0);
  expect(credentials.password.length).toBeGreaterThan(0);

  await page.goto("/login");
  await page.locator('input[name="email"]').fill(credentials.email);
  await page.locator('input[name="password"]').fill(credentials.password);
  await expect(page.locator('form[data-client-ready="true"]')).toBeVisible();
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/app(?:\?.*)?$/, { timeout: 20_000 });
});
