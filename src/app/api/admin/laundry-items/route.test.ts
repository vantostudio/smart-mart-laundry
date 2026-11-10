import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { apiMessages, laundryMessages } from "@/features/admin/messages";
import { thumbnailKey } from "@/features/products/lib/image-keys";
import { createTestDb } from "@/lib/db/test-db";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/features/admin/lib/auth", () => ({ requireAdminForAction: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));
vi.mock("@/lib/storage", () => ({ deleteObject: vi.fn(async () => {}) }));

const { requireAdminForAction } = await import("@/features/admin/lib/auth");
const { getDb } = await import("@/lib/db");
const { revalidateTag } = await import("next/cache");
const { deleteObject } = await import("@/lib/storage");
const { POST } = await import("./route");
const { PATCH, DELETE } = await import("./[id]/route");

/** Every test gets its own photos: a key another row lists is kept. */
const newPhoto = () => `products/${crypto.randomUUID()}.jpg`;

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
  vi.mocked(getDb).mockReturnValue(t.db as never);
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
  vi.mocked(deleteObject).mockClear();
  vi.mocked(requireAdminForAction).mockResolvedValue({
    ok: true,
    admin: { adminId: "a", email: "a@example.com", name: null, role: "owner" },
  });
});

const request = (method: string, body?: unknown) =>
  new Request("http://shop.test/api/admin/laundry-items", {
    method,
    headers: { origin: "http://shop.test", host: "shop.test" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

const context = (id: string) => ({ params: Promise.resolve({ id }) });

const newItem = {
  category: "mats",
  name: "Prayer mat",
  desc: "Washed by hand.",
  price: 120,
  mark: null,
  image: newPhoto(),
};

async function added(overrides = {}) {
  const res = await POST(request("POST", { ...newItem, ...overrides }), undefined);
  expect(res.status).toBe(201);
  return (await res.json()) as { id: string; position: number; image: string };
}

const row = async (id: string) =>
  (await t.client.query("select * from laundry_item where id = $1", [id])).rows[0];

describe("POST /api/admin/laundry-items", () => {
  it("adds an item after the others and shows it on the site at once", async () => {
    const item = await added();
    expect(item.position).toBeGreaterThan(13);
    expect(await row(item.id)).toMatchObject({
      name: "Prayer mat",
      description: "Washed by hand.",
    });
    expect(revalidateTag).toHaveBeenCalledWith("laundry", { expire: 0 });
  });

  it("says which field is wrong, in plain words", async () => {
    const res = await POST(request("POST", { ...newItem, name: "" }), undefined);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatchObject({
      field: "name",
      message: laundryMessages.fields.name,
    });
  });

  it("asks for a photo", async () => {
    const res = await POST(request("POST", { ...newItem, image: "" }), undefined);
    expect((await res.json()).error).toMatchObject({
      field: "image",
      message: laundryMessages.fields.image,
    });
  });

  it("refuses a link for a photo and a group that doesn't exist", async () => {
    for (const bad of [{ image: "https://evil.test/a.jpg" }, { category: "hats" }]) {
      expect((await POST(request("POST", { ...newItem, ...bad }), undefined)).status).toBe(400);
    }
  });

  it("is for the owner only", async () => {
    vi.mocked(requireAdminForAction).mockResolvedValue({
      ok: false,
      error: { code: "FORBIDDEN", message: "No", requestId: "req-1" },
    } as never);
    expect((await POST(request("POST", newItem), undefined)).status).toBe(403);
    expect(vi.mocked(requireAdminForAction)).toHaveBeenCalledWith({ role: "owner" });
  });
});

describe("PATCH /api/admin/laundry-items/[id]", () => {
  it("renames an item and keeps its id and group", async () => {
    const res = await PATCH(request("PATCH", { name: "Tiny basket" }), context("basket-small"));
    expect(res.status).toBe(200);
    expect(await row("basket-small")).toMatchObject({ name: "Tiny basket", category: "baskets" });
    expect(revalidateTag).toHaveBeenCalledWith("laundry", { expire: 0 });
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("can't move an item to another group", async () => {
    const res = await PATCH(request("PATCH", { category: "mats" }), context("basket-medium"));
    expect(res.status).toBe(400);
  });

  it("removes the old photo and thumbnail when it's replaced", async () => {
    const photo = newPhoto();
    const item = await added({ image: photo });
    await PATCH(request("PATCH", { image: newPhoto() }), context(item.id));
    const removed = vi.mocked(deleteObject).mock.calls.map(([key]) => key);
    expect(removed).toHaveLength(2);
    expect(removed).toEqual(expect.arrayContaining([photo, thumbnailKey(photo)]));
  });

  it("leaves our own stock photos alone", async () => {
    await PATCH(request("PATCH", { image: newPhoto() }), context("basket-large"));
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("answers 404 for an item that doesn't exist", async () => {
    const res = await PATCH(request("PATCH", { name: "x" }), context("no-such-item"));
    expect(res.status).toBe(404);
    expect((await res.json()).error.message).toBe(apiMessages.laundryItemNotFound);
  });
});

describe("DELETE /api/admin/laundry-items/[id]", () => {
  it("removes the item and its photo", async () => {
    const photo = newPhoto();
    const item = await added({ image: photo });
    const res = await DELETE(request("DELETE"), context(item.id));
    expect(res.status).toBe(204);
    expect(await row(item.id)).toBeUndefined();
    expect(vi.mocked(deleteObject).mock.calls.map(([key]) => key)).toContain(photo);
    expect(revalidateTag).toHaveBeenCalledWith("laundry", { expire: 0 });
  });

  it("keeps a photo another item still uses", async () => {
    const shared = newPhoto();
    const first = await added({ image: shared });
    await added({ image: shared });
    await DELETE(request("DELETE"), context(first.id));
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("keeps the last item in a group", async () => {
    await DELETE(request("DELETE"), context("shoes-white"));
    const res = await DELETE(request("DELETE"), context("shoes-coloured"));
    expect(res.status).toBe(400);
    expect((await res.json()).error.message).toBe(apiMessages.lastLaundryItem);
    expect(await row("shoes-coloured")).toBeDefined();
  });

  it("answers 404 for an item that doesn't exist", async () => {
    expect((await DELETE(request("DELETE"), context("no-such-item"))).status).toBe(404);
  });

  it("is for the owner only", async () => {
    vi.mocked(requireAdminForAction).mockResolvedValue({
      ok: false,
      error: { code: "FORBIDDEN", message: "No", requestId: "req-1" },
    } as never);
    expect((await DELETE(request("DELETE"), context("mat-door"))).status).toBe(403);
    expect(await row("mat-door")).toBeDefined();
  });
});
