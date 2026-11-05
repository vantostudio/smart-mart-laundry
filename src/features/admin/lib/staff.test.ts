import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { createTestDb } from "@/lib/db/test-db";

import { addStaffInput } from "../schema";
import { addStaff, listStaff, removeStaff, setOwnName, setStaffRole } from "./staff";

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(async () => {
  await t.client.exec("truncate admin_user");
});

const add = (email: string, role: "owner" | "admin" = "admin", name = "Wanjiru") =>
  addStaff(t.db, addStaffInput.parse({ email, name, role }));

const outsider = "00000000-0000-4000-8000-000000000000";

describe("addStaff", () => {
  it("saves the email lowercased and never returns it", async () => {
    const added = await add("  Wanjiru@Example.com ");
    expect(added).toEqual({ id: added.id, name: "Wanjiru", role: "admin" });
    const { rows } = await t.client.query("select email from admin_user");
    expect(rows).toEqual([{ email: "wanjiru@example.com" }]);
  });

  it("refuses an email already on the team, on the email field", async () => {
    await add("wanjiru@example.com");
    await expect(add("WANJIRU@example.com")).rejects.toMatchObject({
      code: "ALREADY_EXISTS",
      field: "email",
    });
  });
});

describe("listStaff", () => {
  it("lists names and roles only", async () => {
    await add("a@example.com", "owner", "Amina");
    await add("b@example.com", "admin", "Baraka");
    const staff = await listStaff(t.db);
    expect(staff.map((s) => [s.name, s.role])).toEqual([
      ["Amina", "owner"],
      ["Baraka", "admin"],
    ]);
    expect(JSON.stringify(staff)).not.toContain("@");
  });
});

describe("setOwnName", () => {
  it("changes the name", async () => {
    const me = await add("a@example.com");
    await setOwnName(t.db, me.id, "New name");
    expect((await listStaff(t.db))[0]?.name).toBe("New name");
  });
});

describe("setStaffRole", () => {
  it("changes someone else's role", async () => {
    const owner = await add("a@example.com", "owner");
    const other = await add("b@example.com");
    expect((await setStaffRole(t.db, owner.id, other.id, "owner")).role).toBe("owner");
    expect((await setStaffRole(t.db, owner.id, other.id, "admin")).role).toBe("admin");
  });

  it("refuses your own role", async () => {
    const owner = await add("a@example.com", "owner");
    await expect(setStaffRole(t.db, owner.id, owner.id, "admin")).rejects.toMatchObject({
      code: "CANNOT_CHANGE_SELF",
    });
  });

  it("refuses to leave no owner", async () => {
    const owner = await add("a@example.com", "owner");
    await expect(setStaffRole(t.db, outsider, owner.id, "admin")).rejects.toMatchObject({
      code: "LAST_OWNER",
    });
    expect((await listStaff(t.db))[0]?.role).toBe("owner");
  });

  it("says when the person has gone", async () => {
    const owner = await add("a@example.com", "owner");
    await expect(setStaffRole(t.db, owner.id, outsider, "admin")).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("removeStaff", () => {
  it("removes someone else", async () => {
    const owner = await add("a@example.com", "owner");
    const other = await add("b@example.com");
    await removeStaff(t.db, owner.id, other.id);
    expect((await listStaff(t.db)).map((s) => s.id)).toEqual([owner.id]);
  });

  it("can remove another owner while one remains", async () => {
    const owner = await add("a@example.com", "owner");
    const other = await add("b@example.com", "owner");
    await removeStaff(t.db, owner.id, other.id);
    expect(await listStaff(t.db)).toHaveLength(1);
  });

  it("refuses to remove yourself", async () => {
    const owner = await add("a@example.com", "owner");
    await expect(removeStaff(t.db, owner.id, owner.id)).rejects.toMatchObject({
      code: "CANNOT_CHANGE_SELF",
    });
  });

  it("refuses to remove the last owner", async () => {
    const owner = await add("a@example.com", "owner");
    await expect(removeStaff(t.db, outsider, owner.id)).rejects.toMatchObject({
      code: "LAST_OWNER",
    });
  });

  it("says when the person has gone", async () => {
    const owner = await add("a@example.com", "owner");
    await expect(removeStaff(t.db, owner.id, outsider)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
