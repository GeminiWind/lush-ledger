import { test as base } from "playwright-bdd";

export type ScenarioContext = {
  generatedEmail: string | null;
  categoryName: string | null;
  categoryId: string | null;
  ledgerNote: string | null;
};

export const test = base.extend<{ scenarioContext: ScenarioContext }>({
  scenarioContext: async ({}, use) => {
    await use({ generatedEmail: null, categoryName: null, categoryId: null, ledgerNote: null });
  },
});
