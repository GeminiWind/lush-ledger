import { defineConfig, devices } from "@playwright/test";

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
      name: "register",
      testMatch: /.*register\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "login",
      testMatch: /.*login\.spec\.ts/,
      dependencies: ["register"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "create-category",
      testMatch: /.*create-category\.spec\.ts/,
      dependencies: ["login"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "update-category",
      testMatch: /.*update-category\.spec\.ts/,
      dependencies: ["create-category"],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "delete-category",
      testMatch: /.*delete-category\.spec\.ts/,
      dependencies: ["login"],
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
