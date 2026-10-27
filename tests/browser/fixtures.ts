import { test as base } from "@playwright/test";
import { pool } from "../../src/lib/db";
// Both suites share one pool in each Playwright worker. Close it only after every suite finishes.
export const test = base.extend<object, { databaseLifecycle: void }>({
  databaseLifecycle: [
    async ({}, use) => {
      await use();
      await pool.end();
    },
    { scope: "worker", auto: true },
  ],
});
