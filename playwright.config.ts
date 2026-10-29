import { defineConfig } from "@playwright/test";

/*
 * Browser checks for layout and the booking flow (`pnpm e2e`). Runs against a server that's
 * already up — `next build && next start -p 3210`, or set E2E_BASE_URL (e.g. a dev server).
 * Uses the installed Microsoft Edge, so no Playwright browser download is needed.
 */
export default defineConfig({
  testDir: "e2e",
  outputDir: ".audit/playwright",
  timeout: 90_000,
  fullyParallel: true,
  workers: 4,
  reporter: [["list"]],
  // A dev server compiles routes on first hit; give navigations and URL updates time to land.
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3210",
    channel: "msedge",
  },
});
