import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";

import * as schema from "./schema";
import type { Db } from "./types";

/* An in-memory Postgres with the real migrations applied. For tests only. */

// From a path string: under jsdom the global `URL` isn't Node's.
export const migrationsFolder = join(dirname(fileURLToPath(import.meta.url)), "../../../drizzle");

export async function createTestDb(): Promise<{
  db: Db;
  client: PGlite;
  close(): Promise<void>;
}> {
  const client = new PGlite();
  const db = drizzle({ client, schema });
  await migrate(db, { migrationsFolder });
  return { db, client, close: () => client.close() };
}

/** Runs `drizzle/rollback/0000_admin_users.sql`, as a person would with `psql -f`. */
export async function applyRollback(client: PGlite): Promise<void> {
  await client.exec(
    await readFile(join(migrationsFolder, "rollback/0000_admin_users.sql"), "utf8"),
  );
}
