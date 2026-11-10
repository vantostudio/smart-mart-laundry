import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vite-plus/test";

import { createTestDb } from "@/lib/db/test-db";
import { product } from "@/lib/db/schema";

import { createProductInput, listProductsInput, updateProductInput } from "../schema";
import { createProduct, deleteProduct, getProduct, listProducts, updateProduct } from "./products";

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

const dress = {
  name: "Linen dress",
  category: "ladies",
  condition: "mtumba",
  price: 800,
  stock: 1,
};

const add = (values = {}) => createProduct(t.db, createProductInput.parse({ ...dress, ...values }));

const missing = "00000000-0000-4000-8000-000000000000";

describe("createProduct", () => {
  it("fills in the id, code, defaults and date", async () => {
    const created = await add();
    expect(created).toMatchObject({ ...dress, code: "SM-1001", sizes: [], images: [], note: null });
    expect(new Date(created.createdAt).toISOString()).toBe(created.createdAt);
    expect(await getProduct(t.db, created.id)).toEqual(created);
  });

  it("gives every product its own code", async () => {
    await add();
    expect((await add()).code).toBe("SM-1002");
  });
});

describe("listProducts", () => {
  const list = (query = {}) => listProducts(t.db, listProductsInput.parse(query));

  it("pages newest first and counts everything", async () => {
    for (const [i, name] of ["a", "b", "c"].entries()) {
      await t.db.insert(product).values({
        ...dress,
        category: "ladies",
        condition: "mtumba",
        name,
        createdAt: new Date(2026, 0, i + 1),
      });
    }
    const names = (page: { items: { name: string }[] }) => page.items.map((item) => item.name);

    const first = await list({ limit: "2" });
    expect(names(first)).toEqual(["c", "b"]);
    expect(first).toMatchObject({ page: 1, limit: 2, total: 3 });

    const last = await list({ limit: "2", page: "2" });
    expect(names(last)).toEqual(["a"]);

    expect(await list({ limit: "2", page: "3" })).toMatchObject({ items: [], total: 3 });
  });

  it("keeps a row on one page when dates tie", async () => {
    const createdAt = new Date(2026, 0, 1);
    await t.db.insert(product).values(
      ["a", "b", "c", "d"].map((name) => ({
        ...dress,
        category: "ladies" as const,
        condition: "mtumba" as const,
        name,
        createdAt,
      })),
    );
    const seen = [];
    for (const page of [1, 2, 3, 4]) seen.push(...(await list({ limit: 1, page })).items);
    expect(new Set(seen.map((item) => item.id)).size).toBe(4);
  });

  it("filters by category, condition or both, and counts the matches", async () => {
    await add();
    await add({ condition: "new" });
    await add({ category: "shoes" });

    expect((await list({ category: "ladies" })).total).toBe(2);
    expect((await list({ condition: "new" })).total).toBe(1);
    const both = await list({ category: "shoes", condition: "mtumba" });
    expect(both.total).toBe(1);
    expect(both.items[0]?.category).toBe("shoes");
  });
});

describe("updateProduct", () => {
  it("changes only what it's given, and can clear the note", async () => {
    const created = await add({ note: "Small mark", sizes: ["M"] });
    const updated = await updateProduct(
      t.db,
      created.id,
      updateProductInput.parse({ price: 650, note: null }),
    );
    expect(updated).toEqual({ ...created, price: 650, note: null });
  });

  it("answers NOT_FOUND for no such product", async () => {
    await expect(updateProduct(t.db, missing, { price: 1 })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("deleteProduct", () => {
  it("removes the product", async () => {
    const { id } = await add();
    await deleteProduct(t.db, id);
    await expect(getProduct(t.db, id)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("answers NOT_FOUND for no such product", async () => {
    await expect(deleteProduct(t.db, missing)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("the table", () => {
  it("refuses what the inputs would refuse, if something gets past them", async () => {
    const insert = (values: object) =>
      t.client.query(
        `insert into product (name, category, condition, price, stock) values ($1, $2, $3, $4, $5)`,
        Object.values({ ...dress, ...values }),
      );
    await expect(insert({ category: "campus" })).rejects.toThrow("product_category_check");
    await expect(insert({ condition: "used" })).rejects.toThrow("product_condition_check");
    await expect(insert({ price: -1 })).rejects.toThrow("product_price_check");
    await expect(insert({ stock: -1 })).rejects.toThrow("product_stock_check");
  });
});
