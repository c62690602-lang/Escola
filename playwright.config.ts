import { defineConfig } from "@playwright/test";
import { randomBytes } from "node:crypto";
process.env.ADMIN_PASSWORD ||= randomBytes(32).toString("hex");
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3100";
process.env.NEXO_DATA_DIR ||= `/tmp/nexo-e2e-${randomBytes(6).toString("hex")}`;
export default defineConfig({
  testDir: "./tests/browser",
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3100",
    headless: true,
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
