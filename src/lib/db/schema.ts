import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgSequence,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/*
 * Our tables, all in `public` and owned by our migrations (`drizzle/`). Neon Auth owns
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

export const productCategories = ["ladies", "men", "shoes"] as const;
export type ProductCategory = (typeof productCategories)[number];

export const productConditions = ["new", "mtumba"] as const;
export type ProductCondition = (typeof productConditions)[number];

/** Numbers the printed tag codes. Gaps are fine: a code only has to be unique. */
export const productCodeSeq = pgSequence("product_code_seq", { startWith: 1001 });

/**
 * What the shop sells. `category` and `condition` are independent: "mtumba" + "ladies". `price` is
 * whole KSh. `code` comes from Postgres and never changes, because it's on the tag.
 */
export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code")
      .notNull()
      .unique()
      .default(sql`'SM-' || nextval('product_code_seq')`),
    name: text("name").notNull(),
    category: text("category", { enum: productCategories }).notNull(),
    condition: text("condition", { enum: productConditions }).notNull(),
    price: integer("price").notNull(),
    sizes: text("sizes")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    stock: integer("stock").notNull(),
    images: text("images")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("product_category_check", sql`${t.category} in (${literals(productCategories)})`),
    check("product_condition_check", sql`${t.condition} in (${literals(productConditions)})`),
    check("product_price_check", sql`${t.price} >= 0`),
    check("product_stock_check", sql`${t.stock} >= 0`),
    index("product_list_idx").on(t.createdAt, t.id),
  ],
);

export type ProductRow = typeof product.$inferSelect;
export type NewProduct = typeof product.$inferInsert;
