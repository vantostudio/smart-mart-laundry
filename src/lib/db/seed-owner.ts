import { z } from "zod";

import { AppError } from "../errors";
import { adminUser } from "./schema";
import type { Db } from "./types";

/*
 * Adds an owner to the allowlist, or does nothing if the email is already there. Used by
 * `pnpm db:seed-owner`. Plain module, so the script and tests can run it.
 */
export async function seedOwner(
  db: Db,
  rawEmail: string,
): Promise<{ inserted: boolean; email: string }> {
  const email = rawEmail.trim().toLowerCase();
  if (!z.email().safeParse(email).success) {
    throw new AppError("VALIDATION", "That email address doesn't look right.", { field: "email" });
  }
  const rows = await db
    .insert(adminUser)
    .values({ email, role: "owner" })
    .onConflictDoNothing({ target: adminUser.email })
    .returning({ id: adminUser.id });
  return { inserted: rows.length > 0, email };
}
