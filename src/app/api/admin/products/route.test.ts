import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createTestDb } from "@/lib/db/test-db";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/features/admin/lib/auth", () => ({ requireAdminForAction: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("@/lib/storage", () => ({ deleteObject: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const { requireAdminForAction } = await import("@/features/admin/lib/auth");
const { getDb } = await import("@/lib/db");
const { deleteObject } = await import("@/lib/storage");
const { revalidateTag } = await import("next/cache");
const collection = await import("./route");
const single = await import("./[id]/route");

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
  vi.mocked(getDb).mockReturnValue(t.db as never);
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(async () => {
  vi.mocked(revalidateTag).mockClear();
  await t.client.exec("truncate product");
  vi.mocked(deleteObject).mockReset();
  vi.mocked(deleteObject).mockResolvedValue();
  vi.mocked(requireAdminForAction).mockResolvedValue({
    ok: true,
    admin: { adminId: "a", email: "a@example.com", name: null, role: "admin" },
  });
});

const base = "http://shop.test/api/admin/products";
const dress = {
  name: "Linen dress",
  category: "ladies",
  condition: "mtumba",
  price: 800,
  stock: 1,
};

function send(method: string, url: string, body?: unknown) {
  return new Request(url, {
    method,
    headers: { origin: "http://shop.test", host: "shop.test" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

const paramsFor = (id: string) => ({ params: Promise.resolve({ id }) });

async function create(values = {}) {
  const res = await collection.POST(send("POST", base, { ...dress, ...values }), undefined);
  return { res, body: await res.json() };
}

describe("/api/admin/products", () => {
  it("creates, reads, changes and deletes a product", async () => {
    const { res, body: created } = await create();
    expect(res.status).toBe(201);
    expect(created).toMatchObject({ ...dress, sizes: [], images: [], note: null });
    const context = paramsFor(created.id);

    const read = await single.GET(send("GET", `${base}/${created.id}`), context);
    expect(await read.json()).toEqual(created);

    const patched = await single.PATCH(
      send("PATCH", `${base}/${created.id}`, { price: 650 }),
      context,
    );
    expect(await patched.json()).toEqual({ ...created, price: 650 });

    const deleted = await single.DELETE(send("DELETE", `${base}/${created.id}`), context);
    expect(deleted.status).toBe(204);
    expect((await single.GET(send("GET", `${base}/${created.id}`), context)).status).toBe(404);
  });

  it("expires the cached public product pages and sitemap after each write", async () => {
    const { body } = await create();
    expect(revalidateTag).toHaveBeenCalledTimes(1);
    expect(revalidateTag).toHaveBeenLastCalledWith("products", { expire: 0 });

    const context = paramsFor(body.id);
    await single.PATCH(send("PATCH", `${base}/${body.id}`, { stock: 0 }), context);
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    await single.DELETE(send("DELETE", `${base}/${body.id}`), context);
    expect(revalidateTag).toHaveBeenCalledTimes(3);
  });

  it("expires nothing when a write fails", async () => {
    await create({ category: "campus" });
    const missing = "5b3f0a7e-6f0e-4a0e-9a63-0c1c1c1c1c1c";
    await single.PATCH(send("PATCH", `${base}/${missing}`, { price: 1 }), paramsFor(missing));
    await single.DELETE(send("DELETE", `${base}/${missing}`), paramsFor(missing));
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("lists a page with filters", async () => {
    await create();
    await create({ condition: "new" });
    const res = await collection.GET(send("GET", `${base}?limit=1&condition=new`), undefined);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const page = await res.json();
    expect(page).toMatchObject({ page: 1, limit: 1, total: 1 });
    expect(page.items).toHaveLength(1);
  });

  it("answers 400 with the field for a bad product", async () => {
    const { res, body } = await create({ category: "campus" });
    expect(res.status).toBe(400);
    expect(body.error).toMatchObject({ code: "VALIDATION", field: "category" });
  });

  it("answers 400 for a bad page, a sort and an empty change", async () => {
    expect((await collection.GET(send("GET", `${base}?page=0`), undefined)).status).toBe(400);
    expect((await collection.GET(send("GET", `${base}?sort=newest`), undefined)).status).toBe(400);
    const { body } = await create();
    const url = `${base}/${body.id}`;
    expect((await single.PATCH(send("PATCH", url, {}), paramsFor(body.id))).status).toBe(400);
  });

  it("answers 404 for a malformed id without asking the database", async () => {
    const res = await single.GET(send("GET", `${base}/nope`), paramsFor("nope"));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe("NOT_FOUND");
  });

  it("answers 401 when signed out, and writes nothing", async () => {
    vi.mocked(requireAdminForAction).mockResolvedValue({
      ok: false,
      error: { code: "UNAUTHENTICATED", message: "Please sign in.", requestId: "req-1" },
    });
    expect((await create()).res.status).toBe(401);
    expect((await t.client.query("select 1 from product")).rows).toEqual([]);
  });
});

describe("photos in storage", () => {
  const photo = (n: number) => `products/00000000-0000-4000-8000-00000000000${n}.webp`;
  const removed = () =>
    vi
      .mocked(deleteObject)
      .mock.calls.map(([key]) => key)
      .sort();

  it("deleting a product removes its photos and thumbnails", async () => {
    const { body } = await create({ images: [photo(1), photo(2)] });
    const res = await single.DELETE(send("DELETE", `${base}/${body.id}`), paramsFor(body.id));
    expect(res.status).toBe(204);
    expect(removed()).toEqual(
      [
        photo(1),
        photo(2),
        photo(1).replace(".webp", "-thumb"),
        photo(2).replace(".webp", "-thumb"),
      ].sort(),
    );
  });

  it("editing removes only the photos that were dropped", async () => {
    const { body } = await create({ images: [photo(1), photo(2), photo(3)] });
    const url = `${base}/${body.id}`;
    const res = await single.PATCH(
      send("PATCH", url, { images: [photo(3), photo(1)] }),
      paramsFor(body.id),
    );
    expect(res.status).toBe(200);
    expect(removed()).toEqual([photo(2), photo(2).replace(".webp", "-thumb")].sort());
  });

  it("a change that doesn't touch the photos removes nothing", async () => {
    const { body } = await create({ images: [photo(1)] });
    await single.PATCH(send("PATCH", `${base}/${body.id}`, { price: 5 }), paramsFor(body.id));
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("keeps a photo that another product still lists", async () => {
    const { body } = await create({ images: [photo(1), photo(2)] });
    await create({ images: [photo(1)] });
    await single.DELETE(send("DELETE", `${base}/${body.id}`), paramsFor(body.id));
    expect(removed()).toEqual([photo(2), photo(2).replace(".webp", "-thumb")].sort());
  });

  it("still succeeds, tries every key and logs only the status when storage fails", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.mocked(deleteObject).mockRejectedValue(
      Object.assign(new Error("secret-value"), { name: "StorageError", code: "503" }),
    );
    const { body } = await create({ images: [photo(1), photo(2)] });
    const res = await single.DELETE(send("DELETE", `${base}/${body.id}`), paramsFor(body.id));
    expect(res.status).toBe(204);
    expect(deleteObject).toHaveBeenCalledTimes(4);
    expect((await single.GET(send("GET", `${base}/${body.id}`), paramsFor(body.id))).status).toBe(
      404,
    );
    const logged = warn.mock.calls.map(([line]) => String(line)).join("\n");
    expect(logged).toContain("503");
    expect(logged).not.toContain("secret-value");
    expect(logged).not.toContain("products/");
    warn.mockRestore();
  });
});
