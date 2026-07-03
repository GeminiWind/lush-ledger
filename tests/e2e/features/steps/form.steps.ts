import { createBdd } from "playwright-bdd";

const { When } = createBdd();

When("I fill {string} with {string}", async ({ page }, field: string, value: string) => {
  await page.locator(`input[name="${field}"]`).fill(value);
});

When("I check {string}", async ({ page }, label: string) => {
  await page.getByRole("checkbox", { name: label }).check();
});

When("I click {string}", async ({ page }, name: string) => {
  const button = page.getByRole("button", { name });
  await button.scrollIntoViewIfNeeded();
  await button.click();
});

When("I fill the total monthly cap with {string}", async ({ page }, value: string) => {
  await page.locator("main input").first().fill(value);
});
