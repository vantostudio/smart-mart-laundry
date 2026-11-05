import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createTestDb } from "@/lib/db/test-db";
import { AppError } from "@/lib/errors";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/features/admin/lib/auth", () => ({ requireAdminForAction: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("@/lib/storage", () => ({
  productImageUrl: (key: string) => `https://photos.test/${key}`,
}));
vi.mock("@/lib/log", () => ({ log: { error: vi.fn(), warn: vi.fn(), info: vi.fn() } }));

const { getDb } = await import("@/lib/db");
const { log } = await import("@/lib/log");
const collection = await import("./route");
const single = await import("./[code]/route");
const settings = await import("../settings/route");

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(async () => {
  vi.mocked(getDb).mockReturnValue(t.db as never);
  vi.mocked(log.error).mockClear();
  await t.client.exec(`
    truncate product; alter sequence product_code_seq restart;
    insert into product (name, category, condition, price, stock) values
      ('Linen dress', 'ladies', 'mtumba', 800, 1), ('Sold shirt', 'men', 'new', 500, 0);
  `);
});

const base = "http://shop.test/api/products";
const get = (url = base) => new Request(url);
const codeContext = (code: string) => ({ params: Promise.resolve({ code }) });

describe("GET /api/products", () => {
  it("answers with a cacheable page of what's in stock", async () => {
    const res = await collection.GET(get(), undefined);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("public, s-maxage=30, stale-while-revalidate=60");
    const body = await res.json();
    expect(body.items.map((p: { code: string }) => p.code)).toEqual(["SM-1001"]);
    expect(body).toMatchObject({ page: 1, limit: 12, total: 1 });
  });

  it("refuses a bad query without caching it", async () => {
    const res = await collection.GET(get(`${base}?nope=1`), undefined);
    expect(res.status).toBe(400);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
    expect(log.error).not.toHaveBeenCalled();
  });

  it("hides what went wrong when the database fails, and logs no text from it", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw Object.assign(new Error("connection to postgres://secret failed"), { code: "57P01" });
    });
    const res = await collection.GET(get(), undefined);
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("secret");
    expect(JSON.stringify(vi.mocked(log.error).mock.calls)).not.toContain("secret");
  });

  it("doesn't name server settings when they're missing", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new AppError("AUTH_UNAVAILABLE", "Server configuration is missing: DATABASE_URL.");
    });
    const res = await collection.GET(get(), undefined);
    expect(res.status).toBe(503);
    expect(await res.text()).not.toContain("DATABASE_URL");
    expect(log.error).toHaveBeenCalled();
  });
});

describe("GET /api/products/[code]", () => {
  it("finds a product, in any letter case", async () => {
    const res = await single.GET(get(), codeContext("sm-1001"));
    expect(res.status).toBe(200);
    expect((await res.json()).name).toBe("Linen dress");
  });

  it("answers 404 for sold out, missing and malformed codes", async () => {
    for (const code of ["SM-1002", "SM-9999", "not-a-code", "SM-1' or 1=1"]) {
      const res = await single.GET(get(), codeContext(code));
      expect(res.status).toBe(404);
      expect(res.headers.get("Cache-Control")).toBe("no-store");
    }
    expect(log.error).not.toHaveBeenCalled();
  });
});

describe("GET /api/settings", () => {
  it("answers with the saved values, cacheably", async () => {
    const res = await settings.GET(get("http://shop.test/api/settings"), undefined);
    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toContain("public");
    expect(await res.json()).toMatchObject({ deliveryFee: 100, phone: "254113154708" });
  });
});
