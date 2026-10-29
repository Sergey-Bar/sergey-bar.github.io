import { defineConfig, devices } from "@playwright/test";

/**
 * The suite runs against the built static export, served exactly as GitHub
 * Pages serves it. Traces, screenshots and video are kept on failure so a red
 * run explains itself; the HTML report is what the deploy publishes at
 * /qa/report/.
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never", outputFolder: "playwright-report" }], ["list"]],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npx serve out -l 4173 --no-clipboard",
    url: "http://localhost:4173/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { ...devices["Pixel 7"] } },
  ],
});
