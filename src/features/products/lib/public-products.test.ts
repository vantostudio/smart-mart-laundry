import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { createTestDb } from "@/lib/db/test-db";

import { createProductInput, listPublicProductsInput } from "../schema";
import { createProduct, getPublicProduct, listPublicProducts } from "./products";

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(async () => {
  await t.client.exec("truncate product; alter sequence product_code_seq restart");
});

const photoUrl = (key: string) => `https://photos.test/${key}`;
const photo = "products/00000000-0000-4000-8000-000000000000.webp";

const add = (values = {}) =>
  createProduct(
    t.db,
    createProductInput.parse({
      name: "Linen dress",
      category: "ladies",
      condition: "mtumba",
      price: 800,
      stock: 1,
      ...values,
    }),
  );

const list = (query = {}) =>
  listPublicProducts(t.db, listPublicProductsInput.parse(query), photoUrl);

const names = async (query = {}) => (await list(query)).items.map((p) => p.name);

describe("listPublicProducts", () => {
  it("shows only what's in stock, and counts only that", async () => {
    await add({ name: "In stock" });
    await add({ name: "Sold out", stock: 0 });
    const page = await list();
    expect(page.items.map((p) => p.name)).toEqual(["In stock"]);
    expect(page.total).toBe(1);
  });

  it("sends only public fields, with photo addresses instead of keys", async () => {
    await add({ images: [photo], sizes: ["M"], note: "Grade A" });
    const [item] = (await list()).items;
    expect(item).toEqual({
      code: "SM-1001",
      name: "Linen dress",
      category: "ladies",
      condition: "mtumba",
      price: 800,
      sizes: ["M"],
      stock: 1,
      note: "Grade A",
      photos: [`https://photos.test/${photo}`],
    });
  });

  it("finds words at the start of a word, in any order", async () => {
    await add({ name: "Women's denim jacket", category: "ladies" });
    await add({ name: "Blue jeans", category: "men", condition: "new" });
    expect(await names({ q: "jacket denim" })).toEqual(["Women's denim jacket"]);
    expect(await names({ q: "men" })).toEqual(["Blue jeans"]);
    expect(await names({ q: "enim" })).toEqual([]);
  });

  it("finds a product by code, with or without the dash, and by condition", async () => {
    await add({ name: "First" });
    await add({ name: "Second", condition: "new" });
    expect(await names({ q: "sm-1002" })).toEqual(["Second"]);
    expect(await names({ q: "SM1002" })).toEqual(["Second"]);
    expect(await names({ q: "mtumba" })).toEqual(["First"]);
  });

  it("treats % and _ in a search as plain characters", async () => {
    await add({ name: "100% cotton tee" });
    await add({ name: "Plain tee" });
    expect(await names({ q: "100%" })).toEqual(["100% cotton tee"]);
    expect(await names({ q: "%" })).toEqual([]);
    expect(await names({ q: "_lain" })).toEqual([]);
  });

  it("filters by category, condition, size and price band", async () => {
    await add({ name: "Dress", sizes: ["M"], price: 499 });
    await add({ name: "Skirt", sizes: ["S"], price: 500, condition: "new" });
    await add({ name: "Boots", category: "shoes", sizes: ["42"], price: 2001 });
    expect(await names({ category: "shoes" })).toEqual(["Boots"]);
    expect(await names({ condition: "new" })).toEqual(["Skirt"]);
    expect(await names({ size: "M" })).toEqual(["Dress"]);
    expect(await names({ price: "under-500" })).toEqual(["Dress"]);
    expect(await names({ price: "500-1000" })).toEqual(["Skirt"]);
    expect(await names({ price: "2000-plus" })).toEqual(["Boots"]);
  });

  it("is newest first unless sorted by price", async () => {
    await add({ name: "Oldest", price: 300 });
    await add({ name: "Middle", price: 100 });
    await add({ name: "Newest", price: 200 });
    expect(await names()).toEqual(["Newest", "Middle", "Oldest"]);
    expect(await names({ sort: "price-asc" })).toEqual(["Middle", "Newest", "Oldest"]);
    expect(await names({ sort: "price-desc" })).toEqual(["Oldest", "Newest", "Middle"]);
  });

  it("pages through without repeats and reports the whole total", async () => {
    for (const name of ["A", "B", "C"]) await add({ name });
    const first = await list({ limit: 2 });
    const second = await list({ limit: 2, page: 2 });
    expect(first.total).toBe(3);
    expect([...first.items, ...second.items].map((p) => p.name)).toEqual(["C", "B", "A"]);
  });

  it("counts every aisle whichever one is chosen, for the same search", async () => {
    await add({ name: "Blue dress" });
    await add({ name: "Blue boots", category: "shoes" });
    await add({ name: "Red boots", category: "shoes" });
    const page = await list({ q: "blue", category: "shoes" });
    expect(page.counts).toEqual({ ladies: 1, men: 0, shoes: 1 });
    expect(page.total).toBe(1);
  });
});

describe("getPublicProduct", () => {
  it("finds a product by code", async () => {
    await add({ images: [photo] });
    const item = await getPublicProduct(t.db, "SM-1001", photoUrl);
    expect(item.photos).toEqual([`https://photos.test/${photo}`]);
    expect(item).not.toHaveProperty("id");
  });

  it("treats sold out the same as missing", async () => {
    await add({ stock: 0 });
    await expect(getPublicProduct(t.db, "SM-1001", photoUrl)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(getPublicProduct(t.db, "SM-9999", photoUrl)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("listPublicProductsInput", () => {
  it("refuses parameters and values it doesn't know", () => {
    for (const bad of [
      { limit: "49" },
      { size: "m" },
      { price: "free" },
      { sort: "newest" },
      { q: "x".repeat(81) },
      { cacheBust: "1" },
    ]) {
      expect(listPublicProductsInput.safeParse(bad).success).toBe(false);
    }
  });
});
