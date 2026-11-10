import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { adminUser } from "./schema";
import { applyRollback, createTestDb, migrationsFolder } from "./test-db";

let t: Awaited<ReturnType<typeof createTestDb>>;

// One in-memory database per file: starting PGlite takes seconds on a busy machine.
beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(async () => {
  await t.client.exec("truncate admin_user");
});

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

async function addAdmin(values: Partial<typeof adminUser.$inferInsert> = {}) {
  const [row] = await t.db
    .insert(adminUser)
    .values({ email: "a@example.com", ...values })
    .returning();
  return row!;
}

/** The constraint Postgres names when it rejects a query (Drizzle keeps the driver error as `cause`). */
async function violated(query: Promise<unknown>): Promise<string | undefined> {
  const err = await query.then(
    () => undefined,
    (e: unknown) => e,
  );
  const pgError = (err as { cause?: unknown } | undefined)?.cause ?? err;
  return (pgError as { constraint?: string } | undefined)?.constraint;
}

async function tableExists(name: string) {
  const { rows } = await t.client.query<{ reg: string | null }>(
    `select to_regclass('public.${name}')::text as reg`,
  );
  return rows[0]?.reg !== null;
}

describe("admin_user", () => {
  it("fills in role, id and created_at", async () => {
    const row = await addAdmin();
    expect(row.role).toBe("admin");
    expect(row.id).toMatch(uuid);
    expect(row.createdAt).toBeInstanceOf(Date);
    expect(row.name).toBeNull();
  });

  it("rejects a duplicate email", async () => {
    await addAdmin();
    expect(await violated(addAdmin())).toBe("admin_user_email_unique");
  });

  it("rejects an upper-case email", async () => {
    expect(await violated(addAdmin({ email: "A@Example.com" }))).toBe("admin_user_email_lower");
  });

  it("rejects an unknown role", async () => {
    const boss = t.client.query(
      `insert into admin_user (email, role) values ('b@example.com', 'boss')`,
    );
    expect(await violated(boss)).toBe("admin_user_role_check");
  });
});

describe("migration", () => {
  it("leaves only our tables in public", async () => {
    const { rows } = await t.client.query<{ table_name: string }>(
      `select table_name from information_schema.tables where table_schema = 'public'`,
    );
    expect(rows.map((r) => r.table_name).toSorted()).toEqual([
      "admin_user",
      "laundry_item",
      "product",
      "shop_settings",
    ]);
  });

  it("gives admin_user exactly its five columns", async () => {
    const { rows } = await t.client.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_schema = 'public' and table_name = 'admin_user' order by ordinal_position`,
    );
    expect(rows.map((r) => r.column_name)).toEqual(["id", "email", "name", "role", "created_at"]);
  });

  it("rolls back every migration and applies them again", async () => {
    await addAdmin({ role: "owner" });

    await applyRollback(t.client, "0005_laundry_items");
    await applyRollback(t.client, "0004_shop_settings");
    await applyRollback(t.client, "0003_remove_kids_category");
    await applyRollback(t.client, "0002_products");
    expect(await tableExists("product")).toBe(false);
    await applyRollback(t.client, "0001_drop_audit_log");
    expect(await tableExists("admin_event")).toBe(true);
    await applyRollback(t.client, "0000_admin_users");
    expect(await tableExists("admin_user")).toBe(false);
    expect(await tableExists("admin_event")).toBe(false);

    await migrate(drizzle({ client: t.client }), { migrationsFolder });
    expect(await tableExists("admin_user")).toBe(true);
    expect(await tableExists("product")).toBe(true);
    expect(await tableExists("admin_event")).toBe(false);
    expect(await t.db.select().from(adminUser)).toEqual([]);
  });
});
