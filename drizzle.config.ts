import { defineConfig } from "drizzle-kit";

// `db:migrate` after `neon deploy`: pick up `.env.local` when it exists, without overriding
// variables that are already set. A missing file is fine, so `db:generate` works with no env.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No `.env.local`.
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  schemaFilter: ["public"],
  // The direct (unpooled) URL for DDL, else the pooled one.
  dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
