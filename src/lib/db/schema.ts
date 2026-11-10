import { sql } from "drizzle-orm";
import {
  boolean,
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

/**
 * What staff can change about the shop. One row, added by the migration: `id` can only be true.
 * Fee and threshold are whole KSh, `phone` is digits ("254113154708") for both calls and WhatsApp,
 * and opening times are whole hours (24 h) because pickup booking works in whole hours.
 */
export const shopSettings = pgTable(
  "shop_settings",
  {
    id: boolean("id").primaryKey().default(true),
    deliveryFee: integer("delivery_fee").notNull(),
    deliveryFreeFrom: integer("delivery_free_from").notNull(),
    phone: text("phone").notNull(),
    weekOpen: integer("week_open").notNull(),
    weekClose: integer("week_close").notNull(),
    sundayOpen: integer("sunday_open").notNull(),
    sundayClose: integer("sunday_close").notNull(),
  },
  (t) => [
    check("shop_settings_one_row", sql`${t.id}`),
    check(
      "shop_settings_delivery_check",
      sql`${t.deliveryFee} >= 0 and ${t.deliveryFreeFrom} >= 0`,
    ),
    check(
      "shop_settings_week_hours_check",
      sql`${t.weekOpen} >= 0 and ${t.weekOpen} < ${t.weekClose} and ${t.weekClose} <= 24`,
    ),
    check(
      "shop_settings_sunday_hours_check",
      sql`${t.sundayOpen} >= 0 and ${t.sundayOpen} < ${t.sundayClose} and ${t.sundayClose} <= 24`,
    ),
  ],
);

export const laundryCategoryIds = ["baskets", "duvets", "mats", "shoes"] as const;
export type LaundryCategory = (typeof laundryCategoryIds)[number];

/**
 * What the laundry page lists. `price` is whole KSh. `image` is an Unsplash photo id or a storage key
 * from our upload, and `mark` is the size shown on the card ("S", "6×6"). `position` keeps the order
 * on the page: new items go last. The migration adds today's items; staff manage them from there.
 */
export const laundryItem = pgTable(
  "laundry_item",
  {
    id: text("id").primaryKey(),
    category: text("category", { enum: laundryCategoryIds }).notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    price: integer("price").notNull(),
    image: text("image").notNull(),
    mark: text("mark"),
    position: integer("position").notNull(),
  },
  (t) => [
    check("laundry_item_category_check", sql`${t.category} in (${literals(laundryCategoryIds)})`),
    check("laundry_item_price_check", sql`${t.price} > 0`),
    index("laundry_item_order_idx").on(t.position),
  ],
);

export type LaundryItemRow = typeof laundryItem.$inferSelect;
