import { defineConfig, devices } from "@playwright/test";
import { defineBddProject } from "playwright-bdd";

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      ...defineBddProject({
        name: "register",
        features: "tests/e2e/features/register.feature",
        steps: "tests/e2e/features/steps/**/*.ts",
      }),
      use: { ...devices["Desktop Chrome"] },
    },
    {
      ...defineBddProject({
        name: "login",
        features: "tests/e2e/features/login.feature",
        steps: "tests/e2e/features/steps/**/*.ts",
      }),
      dependencies: ["register"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      ...defineBddProject({
        name: "create-category",
        features: "tests/e2e/features/create-category.feature",
        steps: "tests/e2e/features/steps/**/*.ts",
      }),
      dependencies: ["login"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      ...defineBddProject({
        name: "update-category",
        features: "tests/e2e/features/update-category.feature",
        steps: "tests/e2e/features/steps/**/*.ts",
      }),
      dependencies: ["create-category"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      ...defineBddProject({
        name: "delete-category",
        features: "tests/e2e/features/delete-category.feature",
        steps: "tests/e2e/features/steps/**/*.ts",
      }),
      dependencies: ["login"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      ...defineBddProject({
        name: "ledger-date-grouping",
        features: "tests/e2e/features/ledger-date-grouping.feature",
        steps: "tests/e2e/features/steps/**/*.ts",
      }),
      dependencies: ["login"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
