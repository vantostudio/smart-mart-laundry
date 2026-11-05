import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vite-plus/test";

import type { Db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { createTestDb } from "@/lib/db/test-db";

import { resolveAdmin } from "./auth";
import type { SessionUser } from "./neon-auth";

vi.mock("server-only", () => ({}));
// The SDK imports `next/headers` in a way Node can't resolve outside Next; `resolveAdmin` never uses it.
vi.mock("@neon/auth/next/server", () => ({ createNeonAuth: vi.fn<() => never>() }));

let t: Awaited<ReturnType<typeof createTestDb>>;

// One in-memory database per file: starting PGlite takes seconds on a busy machine.
beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

let warn: MockInstance<typeof console.warn>;
let info: MockInstance<typeof console.log>;
let error: MockInstance<typeof console.error>;

beforeEach(async () => {
  await t.client.exec("truncate admin_user");
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  info = vi.spyOn(console, "log").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function addAdmin(values: Partial<typeof adminUser.$inferInsert>) {
  const [row] = await t.db
    .insert(adminUser)
    .values({ email: "owner@example.com", ...values })
    .returning();
  return row!;
}

function run(session: SessionUser | null, requestId = "req-1") {
  const db = vi.fn<() => Db>(() => t.db);
  const decision = resolveAdmin({ readSession: async () => session, db, requestId });
  return { db, decision };
}

/** Every JSON line written through `log`. */
function lines(): Record<string, unknown>[] {
  return [warn, info, error].flatMap((spy) =>
    spy.mock.calls.map((call) => JSON.parse(String(call[0])) as Record<string, unknown>),
  );
}

function denials() {
  return lines().filter((line) => line.msg === "sign_in_denied");
}

async function allRows() {
  return t.db.select().from(adminUser).orderBy(adminUser.email);
}

describe("resolveAdmin", () => {
  it("gives unauthenticated with no session, without touching the db or logging", async () => {
    await addAdmin({ role: "owner" });
    const before = await allRows();
    const { db, decision } = run(null);
    await expect(decision).resolves.toEqual({ status: "unauthenticated" });
    expect(db).not.toHaveBeenCalled();
    expect(lines()).toEqual([]);
    expect(await allRows()).toEqual(before);
  });

  it("refuses an unverified email even when it is on the allowlist", async () => {
    await addAdmin({ role: "owner" });
    const before = await allRows();
    const { db, decision } = run({
      email: "owner@example.com",
      emailVerified: false,
      name: "Owner",
    });
    await expect(decision).resolves.toEqual({ status: "forbidden" });
    expect(db).not.toHaveBeenCalled();
    expect(denials()).toEqual([
      {
        level: "warn",
        msg: "sign_in_denied",
        requestId: "req-1",
        reason: "unverified_email",
        emailDomain: "example.com",
      },
    ]);
    expect(await allRows()).toEqual(before);
  });

  it("matches a verified email after trimming and lower-casing it", async () => {
    const row = await addAdmin({ email: "owner@example.com", name: "Mo", role: "owner" });
    const before = await allRows();
    const { db, decision } = run({
      email: " Owner@Example.COM ",
      emailVerified: true,
      name: "Someone Else",
    });
    await expect(decision).resolves.toEqual({
      status: "admin",
      admin: { adminId: row.id, email: "owner@example.com", name: "Mo", role: "owner" },
    });
    expect(db).toHaveBeenCalledTimes(1);
    expect(denials()).toEqual([]);
    expect(lines()).toEqual([]);
    expect(await allRows()).toEqual(before);
  });

  it("refuses a verified email with no row and logs only its domain", async () => {
    await addAdmin({ email: "owner@example.com", role: "owner" });
    const before = await allRows();
    const { decision } = run(
      { email: "Stranger.Person@Example.com", emailVerified: true, name: "Stranger Person" },
      "ray-42",
    );
    await expect(decision).resolves.toEqual({ status: "forbidden" });
    const denied = denials();
    expect(denied).toEqual([
      {
        level: "warn",
        msg: "sign_in_denied",
        requestId: "ray-42",
        reason: "not_on_allowlist",
        emailDomain: "example.com",
      },
    ]);
    const written = JSON.stringify(lines());
    expect(written.toLowerCase()).not.toContain("stranger");
    expect(written).not.toContain("@");
    expect(await allRows()).toEqual(before);
  });

  it("logs unknown as the domain of an email with no @", async () => {
    const { decision } = run({ email: "nobody", emailVerified: true, name: null });
    await expect(decision).resolves.toEqual({ status: "forbidden" });
    expect(denials()).toEqual([expect.objectContaining({ emailDomain: "unknown" })]);
  });

  it("takes the role from the row, never from the session", async () => {
    const row = await addAdmin({ email: "staff@example.com", name: null, role: "admin" });
    const before = await allRows();
    const session = {
      email: "staff@example.com",
      emailVerified: true,
      name: "Staff",
      role: "owner",
      id: "someone-else",
    } as SessionUser;
    const { decision } = run(session);
    await expect(decision).resolves.toEqual({
      status: "admin",
      admin: { adminId: row.id, email: "staff@example.com", name: "Staff", role: "admin" },
    });
    expect(await allRows()).toEqual(before);
  });

  it("lets an error from the session reader propagate", async () => {
    const failure = new Error("reader broke");
    const db = vi.fn<() => Db>(() => t.db);
    const decision = resolveAdmin({
      readSession: () => Promise.reject(failure),
      db,
      requestId: "req-1",
    });
    await expect(decision).rejects.toBe(failure);
    expect(db).not.toHaveBeenCalled();
  });
});
