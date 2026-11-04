import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  bigint,
  check,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/*
 * The admin tables, all in `public` and owned by our migrations (`drizzle/`). Neon Auth owns
 * `neon_auth.*`; nothing here points into it. After a change run `pnpm db:generate` and review the
 * SQL. A plain module: drizzle-kit, the seed script and tests load it.
 */

export const adminRoles = ["owner", "admin"] as const;
export type AdminRole = (typeof adminRoles)[number];

export const adminEventActions = [
  "sign_in",
  "sign_in_denied",
  "sign_out",
  "admin_added",
  "admin_role_changed",
  "admin_disabled",
  "admin_enabled",
] as const;

/** A fixed list of names as SQL string literals, for check constraints. */
const literals = (values: readonly string[]) =>
  sql.raw(values.map((value) => `'${value}'`).join(", "));

/**
 * Who may use the admin area. Rows are never deleted, because audit rows point at them: disable a
 * row instead, or blank `name` and replace `email` to erase someone.
 */
export const adminUser = pgTable(
  "admin_user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull().unique(),
    name: text("name"),
    role: text("role", { enum: adminRoles }).notNull().default("admin"),
    authUserId: text("auth_user_id").unique(),
    disabledAt: timestamp("disabled_at", { withTimezone: true }),
    createdBy: uuid("created_by").references((): AnyPgColumn => adminUser.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastSignInAt: timestamp("last_sign_in_at", { withTimezone: true }),
  },
  (t) => [
    check("admin_user_email_lower", sql`${t.email} = lower(${t.email})`),
    check("admin_user_role_check", sql`${t.role} in (${literals(adminRoles)})`),
  ],
);

/** Append-only audit log. `detail` never holds tokens or secrets. */
export const adminEvent = pgTable(
  "admin_event",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
    action: text("action", { enum: adminEventActions }).notNull(),
    actorAdminId: uuid("actor_admin_id").references(() => adminUser.id),
    targetAdminId: uuid("target_admin_id").references(() => adminUser.id),
    detail: jsonb("detail").$type<Record<string, unknown>>().notNull().default({}),
    requestId: text("request_id").notNull(),
  },
  (t) => [
    check("admin_event_action_check", sql`${t.action} in (${literals(adminEventActions)})`),
    index("admin_event_at_idx").on(t.at.desc()),
  ],
);

export type AdminUser = typeof adminUser.$inferSelect;
export type NewAdminUser = typeof adminUser.$inferInsert;
export type AdminEvent = typeof adminEvent.$inferSelect;
export type NewAdminEvent = typeof adminEvent.$inferInsert;
