// Stops `pnpm cf:build` when a `.env*` file other than `.env.example` sits in the repo root.
//
// usage:  node scripts/check-no-env-files.mjs
//
// OpenNext copies the values in `.env`, `.env.local` and `.env.production*` into the Worker
// bundle, and the deployed Worker falls back to them for any secret Wrangler doesn't set. So a
// build from a machine with real values in `.env.local` would ship them. Secrets belong in
// `wrangler secret put <NAME>`, and local preview values in `.dev.vars`.
import { readdirSync } from "node:fs";

const found = readdirSync(".").filter((name) => name.startsWith(".env") && name !== ".env.example");

if (found.length > 0) {
  console.error(
    `cf:build stopped: ${found.join(", ")} would be bundled into the Worker.\n` +
      "Move them out of the repo root for the build. Secrets go in `wrangler secret put <NAME>`, " +
      "and local preview values in `.dev.vars`.",
  );
  process.exit(1);
}
