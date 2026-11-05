import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createTestDb } from "@/lib/db/test-db";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/features/admin/lib/auth", () => ({ requireAdminForAction: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));

const { requireAdminForAction } = await import("@/features/admin/lib/auth");
const { getDb } = await import("@/lib/db");
const collection = await import("./route");
const single = await import("./[id]/route");
const me = await import("../me/route");
const settings = await import("../settings/route");

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
  vi.mocked(getDb).mockReturnValue(t.db as never);
}, 60_000);

afterAll(async () => {
  await t.close();
});

const ownerId = "11111111-1111-4111-8111-111111111111";

beforeEach(async () => {
  await t.client.exec(
    `truncate admin_user; insert into admin_user (id, email, role) values ('${ownerId}', 'o@example.com', 'owner')`,
  );
  vi.mocked(requireAdminForAction).mockReset();
  vi.mocked(requireAdminForAction).mockResolvedValue({
    ok: true,
    admin: { adminId: ownerId, email: "o@example.com", name: null, role: "owner" },
  });
});

function send(method: string, url: string, body?: unknown, origin = "http://shop.test") {
  return new Request(url, {
    method,
    headers: { origin, host: "shop.test" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const base = "http://shop.test/api/admin/staff";
const paramsFor = (id: string) => ({ params: Promise.resolve({ id }) });
const person = { email: "w@example.com", name: "Wanjiru", role: "admin" };

describe("/api/admin/staff", () => {
  it("adds, changes and removes someone, never returning an email", async () => {
    const res = await collection.POST(send("POST", base, person), undefined);
    expect(res.status).toBe(201);
    const added = await res.json();
    expect(added).toEqual({ id: added.id, name: "Wanjiru", role: "admin" });

    const context = paramsFor(added.id);
    const changed = await single.PATCH(send("PATCH", `${base}/${added.id}`, { role: "owner" }), context);
    expect((await changed.json()).role).toBe("owner");

    const removed = await single.DELETE(send("DELETE", `${base}/${added.id}`), context);
    expect(removed.status).toBe(204);
  });

  it("asks for an owner on every staff and shop settings write", async () => {
    const id = "22222222-2222-4222-8222-222222222222";
    await collection.POST(send("POST", base, person), undefined);
    await single.PATCH(send("PATCH", `${base}/${id}`, { role: "admin" }), paramsFor(id));
    await single.DELETE(send("DELETE", `${base}/${id}`), paramsFor(id));
    await settings.PATCH(
      send("PATCH", "http://shop.test/api/admin/settings", { deliveryFee: 120 }),
      undefined,
    );
    for (const call of vi.mocked(requireAdminForAction).mock.calls) {
      expect(call[0]).toEqual({ role: "owner" });
    }
    expect(vi.mocked(requireAdminForAction)).toHaveBeenCalledTimes(4);
  });

  it("passes on an owner-only refusal", async () => {
    vi.mocked(requireAdminForAction).mockResolvedValue({
      ok: false,
      error: { code: "FORBIDDEN", message: "No", requestId: "req-1" },
    });
    const res = await collection.POST(send("POST", base, person), undefined);
    expect(res.status).toBe(403);
  });

  it("refuses a write from another site", async () => {
    const res = await collection.POST(send("POST", base, person, "http://evil.test"), undefined);
    expect(res.status).toBe(403);
    expect(requireAdminForAction).not.toHaveBeenCalled();
  });

  it("answers 409 for a duplicate and for changing yourself, 404 for a bad id", async () => {
    const duplicate = await collection.POST(
      send("POST", base, { ...person, email: "o@example.com" }),
      undefined,
    );
    expect(duplicate.status).toBe(409);
    expect(await duplicate.text()).not.toContain("o@example.com");

    const self = await single.DELETE(send("DELETE", `${base}/${ownerId}`), paramsFor(ownerId));
    expect(self.status).toBe(409);

    const bad = await single.DELETE(send("DELETE", `${base}/nope`), paramsFor("nope"));
    expect(bad.status).toBe(404);
  });

  it("answers 400 naming a bad field", async () => {
    const res = await collection.POST(send("POST", base, { ...person, email: "nope" }), undefined);
    expect(res.status).toBe(400);
    expect((await res.json()).error.field).toBe("email");
  });
});

describe("PATCH /api/admin/me", () => {
  it("lets any admin change their own name, with no owner check", async () => {
    const res = await me.PATCH(
      send("PATCH", "http://shop.test/api/admin/me", { name: "  Victor " }),
      undefined,
    );
    expect(await res.json()).toEqual({ name: "Victor" });
    expect(requireAdminForAction).toHaveBeenCalledWith(undefined);
    const { rows } = await t.client.query("select name from admin_user");
    expect(rows).toEqual([{ name: "Victor" }]);
  });
});

describe("PATCH /api/admin/settings", () => {
  it("saves and returns the settings", async () => {
    const res = await settings.PATCH(
      send("PATCH", "http://shop.test/api/admin/settings", { deliveryFee: 120 }),
      undefined,
    );
    expect((await res.json()).deliveryFee).toBe(120);
  });

  it("answers 400 naming the closing time", async () => {
    const res = await settings.PATCH(
      send("PATCH", "http://shop.test/api/admin/settings", { weekOpen: 18, weekClose: 8 }),
      undefined,
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error.field).toBe("weekClose");
  });
});
