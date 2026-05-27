import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "battery-manager-ux-audit.spec.ts",
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 120000,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: process.env.UX_AUDIT_BASE_URL || "http://localhost:3000",
    headless: true,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
