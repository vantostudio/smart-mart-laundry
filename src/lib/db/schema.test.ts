import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { adminEvent, adminUser } from "./schema";
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
  await t.client.exec("truncate admin_event, admin_user restart identity");
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
    expect(row).toMatchObject({ name: null, authUserId: null, disabledAt: null, createdBy: null });
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

  it("rejects a duplicate auth_user_id", async () => {
    await addAdmin({ email: "a@example.com", authUserId: "auth-1" });
    expect(await violated(addAdmin({ email: "b@example.com", authUserId: "auth-1" }))).toBe(
      "admin_user_auth_user_id_unique",
    );
  });

  it("links created_by to another admin", async () => {
    const owner = await addAdmin({ role: "owner" });
    const added = await addAdmin({ email: "b@example.com", createdBy: owner.id });
    expect(added.createdBy).toBe(owner.id);
  });
});

describe("admin_event", () => {
  it("fills in id, at and an empty detail", async () => {
    const [row] = await t.db
      .insert(adminEvent)
      .values({ action: "sign_in", requestId: "req-1" })
      .returning();
    expect(typeof row?.id).toBe("number");
    expect(row?.at).toBeInstanceOf(Date);
    expect(row?.detail).toEqual({});
  });

  it("rejects an unknown action", async () => {
    const hacked = t.client.query(
      `insert into admin_event (action, request_id) values ('hacked', 'req-1')`,
    );
    expect(await violated(hacked)).toBe("admin_event_action_check");
  });

  it("rejects an unknown actor", async () => {
    const unknownActor = t.db.insert(adminEvent).values({
      action: "sign_in",
      requestId: "req-1",
      actorAdminId: "00000000-0000-4000-8000-000000000000",
    });
    expect(await violated(unknownActor)).toBe("admin_event_actor_admin_id_admin_user_id_fk");
  });

  it("has the index on at desc", async () => {
    const { rows } = await t.client.query<{ indexdef: string }>(
      `select indexdef from pg_indexes where indexname = 'admin_event_at_idx'`,
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.indexdef).toMatch(/\(at DESC/);
  });
});

describe("migration", () => {
  it("puts both tables in public", async () => {
    const { rows } = await t.client.query<{ table_schema: string; table_name: string }>(
      `select table_schema, table_name from information_schema.tables
       where table_name in ('admin_user', 'admin_event') order by table_name`,
    );
    expect(rows).toEqual([
      { table_schema: "public", table_name: "admin_event" },
      { table_schema: "public", table_name: "admin_user" },
    ]);
  });

  it("rolls back and applies again", async () => {
    const owner = await addAdmin({ role: "owner" });
    await t.db
      .insert(adminEvent)
      .values({ action: "sign_in", requestId: "r", actorAdminId: owner.id });

    await applyRollback(t.client);
    expect(await tableExists("admin_user")).toBe(false);
    expect(await tableExists("admin_event")).toBe(false);

    await migrate(drizzle({ client: t.client }), { migrationsFolder });
    expect(await tableExists("admin_user")).toBe(true);
    expect(await tableExists("admin_event")).toBe(true);
    expect(await t.db.select().from(adminUser)).toEqual([]);
    expect(await t.db.select().from(adminEvent)).toEqual([]);
  });
});
