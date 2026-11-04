import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { AppError } from "@/lib/errors";

import { adminUser } from "./schema";
import { seedOwner } from "./seed-owner";
import { createTestDb } from "./test-db";

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

describe("seedOwner", () => {
  it("adds a trimmed, lower-case owner", async () => {
    await expect(seedOwner(t.db, "  JustMogen@Gmail.com ")).resolves.toEqual({
      inserted: true,
      email: "justmogen@gmail.com",
    });
    const rows = await t.db.select().from(adminUser);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ email: "justmogen@gmail.com", role: "owner" });
  });

  it("does nothing the second time", async () => {
    await seedOwner(t.db, "justmogen@gmail.com");
    await expect(seedOwner(t.db, "JustMogen@gmail.com")).resolves.toEqual({
      inserted: false,
      email: "justmogen@gmail.com",
    });
    expect(await t.db.select().from(adminUser)).toHaveLength(1);
  });

  it("rejects a bad email and inserts nothing", async () => {
    const err = await seedOwner(t.db, "not-an-email").catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ code: "VALIDATION", field: "email" });
    expect(await t.db.select().from(adminUser)).toHaveLength(0);
  });
});
