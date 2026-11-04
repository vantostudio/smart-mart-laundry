import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/*
 * The admin tables, all in `public` and owned by our migrations (`drizzle/`). Neon Auth owns
 * `neon_auth.*`; nothing here points into it. After a change run `pnpm db:generate` and review the
 * SQL. A plain module: drizzle-kit, the seed script and tests load it.
 */

export const adminRoles = ["owner", "admin"] as const;
export type AdminRole = (typeof adminRoles)[number];

/** A fixed list of names as SQL string literals, for check constraints. */
const literals = (values: readonly string[]) =>
  sql.raw(values.map((value) => `'${value}'`).join(", "));

/**
 * Who may use the admin area: a Google account whose verified email has a row here. Delete the
 * row to take someone's access away.
 */
export const adminUser = pgTable(
  "admin_user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    role: text("role", { enum: adminRoles }).notNull().default("admin"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("admin_user_email_lower", sql`${t.email} = lower(${t.email})`),
    check("admin_user_role_check", sql`${t.role} in (${literals(adminRoles)})`),
  ],
);

export type AdminUser = typeof adminUser.$inferSelect;
export type NewAdminUser = typeof adminUser.$inferInsert;
