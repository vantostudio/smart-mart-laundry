// Adds the first owner to the admin allowlist, or does nothing if they're already on it.
//
// usage:  pnpm db:seed-owner <email>
//
// Uses DATABASE_URL_UNPOOLED (the direct Neon URL), else DATABASE_URL, from the environment or
// `.env.local`. Prints only the email and the outcome: never the connection string or a driver
// error.
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { z } from "zod";

import { AppError } from "../src/lib/errors";
import * as schema from "../src/lib/db/schema";
import { seedOwner } from "../src/lib/db/seed-owner";

const databaseUrl = z.url({ protocol: /^postgres(ql)?$/ });

function fail(reason: string): never {
  console.error(reason);
  process.exit(1);
}

const rawEmail = process.argv[2];
if (!rawEmail) fail("Usage: pnpm db:seed-owner <email>");

const url = databaseUrl.safeParse(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL);
if (!url.success) {
  fail("Set DATABASE_URL_UNPOOLED or DATABASE_URL to a postgres:// connection string.");
}

try {
  const db = drizzle({ client: neon(url.data), schema });
  const { inserted, email } = await seedOwner(db, rawEmail);
  console.log(
    inserted ? `Owner ${email} added.` : `Owner ${email} already exists; nothing changed.`,
  );
} catch (err) {
  if (err instanceof AppError) fail(err.message);
  fail(`Seeding failed: ${err instanceof Error ? err.name : "unknown error"}`);
}
