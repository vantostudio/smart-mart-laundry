import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { createTestDb } from "@/lib/db/test-db";
import { AppError } from "@/lib/errors";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("@/lib/log", () => ({ log: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("@/lib/storage", () => ({
  productImageUrl: (key: string) => `https://photos.test/${key}`,
}));

const { cacheLife, cacheTag } = await import("next/cache");
const { getDb } = await import("@/lib/db");
const { log } = await import("@/lib/log");
const { getCachedPublicProduct, getCachedSitemapCodes } = await import("./cached-products");

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(async () => {
  vi.clearAllMocks();
  vi.mocked(getDb).mockReturnValue(t.db as never);
  await t.client.exec(`
    truncate product; alter sequence product_code_seq restart;
    insert into product (name, category, condition, price, stock, images) values
      ('Linen dress', 'ladies', 'mtumba', 800, 1, '{products/a.jpg}'),
      ('Sold shirt', 'men', 'new', 500, 0, '{}'),
      ('Sneakers', 'shoes', 'new', 2500, 3, '{}');
  `);
});

describe("getCachedPublicProduct", () => {
  it("gives the public product with photo addresses, tagged products", async () => {
    const p = await getCachedPublicProduct("SM-1001");
    expect(p).toMatchObject({
      code: "SM-1001",
      name: "Linen dress",
      photos: ["https://photos.test/products/a.jpg"],
    });
    expect(p).not.toHaveProperty("id");
    expect(p).not.toHaveProperty("createdAt");
    expect(p).not.toHaveProperty("images");
    expect(cacheTag).toHaveBeenCalledWith("products");
  });

  it("gives null for sold out and for a code that doesn't exist", async () => {
    expect(await getCachedPublicProduct("SM-1002")).toBeNull();
    expect(await getCachedPublicProduct("SM-9999")).toBeNull();
  });

  it("throws on a database failure, so it is never cached as not found", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new AppError("AUTH_UNAVAILABLE", "No env");
    });
    await expect(getCachedPublicProduct("SM-1001")).rejects.toThrow("No env");
    vi.mocked(getDb).mockReturnValue({
      select: () => {
        throw new Error("connection refused");
      },
    } as never);
    await expect(getCachedPublicProduct("SM-1001")).rejects.toThrow("connection refused");
  });
});

describe("getCachedSitemapCodes", () => {
  it("lists only what is in stock, newest first, for hours", async () => {
    expect(await getCachedSitemapCodes()).toEqual(["SM-1003", "SM-1001"]);
    expect(cacheTag).toHaveBeenCalledWith("products");
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("is empty and short-lived with no database env, without a log line", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new AppError("AUTH_UNAVAILABLE", "No env");
    });
    expect(await getCachedSitemapCodes()).toEqual([]);
    expect(log.warn).not.toHaveBeenCalled();
    expect(vi.mocked(cacheLife).mock.calls[0]![0]).toMatchObject({ revalidate: 60 });
  });

  it("is empty, short-lived and logged when the database fails", async () => {
    vi.mocked(getDb).mockImplementation(() => {
      throw new Error("down");
    });
    expect(await getCachedSitemapCodes()).toEqual([]);
    expect(log.warn).toHaveBeenCalledOnce();
  });
});
