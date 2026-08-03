import { defineConfig, devices } from "@playwright/test";

const isContinuousIntegration = process.env.CI === "true";

export default defineConfig({
  testDir: "./tests/e2e",

  fullyParallel: true,

  forbidOnly: isContinuousIntegration,

  retries: isContinuousIntegration ? 2 : 0,

  ...(isContinuousIntegration
    ? {
        workers: 1,
      }
    : {}),

  reporter: isContinuousIntegration
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],

  webServer: {
    command: "pnpm exec next dev --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100/login",
    reuseExistingServer: !isContinuousIntegration,
    timeout: 120_000,
  },
});
