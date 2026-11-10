import { describe, expect, it } from "vite-plus/test";

import { createProductInput, listProductsInput, updateProductInput } from "./schema";

const photo = "products/00000000-0000-4000-8000-000000000000.webp";
const valid = { name: "Linen dress", category: "ladies", condition: "new", price: 800, stock: 1 };

describe("createProductInput", () => {
  it("needs only the five required fields, and trims text", () => {
    expect(createProductInput.parse({ ...valid, name: "  Linen dress " })).toEqual(valid);
  });

  it.each([
    ["an id", { id: "x" }],
    ["a code", { code: "SM-1" }],
    ["an unknown field", { brand: "x" }],
    ["an old category", { category: "campus" }],
    ["the removed kids category", { category: "kids" }],
    ["an unknown condition", { condition: "used" }],
    ["a negative price", { price: -1 }],
    ["a fractional price", { price: 1.5 }],
    ["a price too big for Postgres", { price: 2_147_483_648 }],
    ["negative stock", { stock: -1 }],
    ["an empty name", { name: "   " }],
    ["a NUL byte", { name: "a\0b" }],
    ["a size in the wrong case", { sizes: ["m"] }],
    ["a size typed by hand", { sizes: ["Medium"] }],
    ["a shoe size on clothes", { sizes: ["42"] }],
    ["too many photos", { images: Array.from({ length: 7 }, () => photo) }],
    ["a link for a photo", { images: ["https://evil.test/a.webp"] }],
    ["a key outside products", { images: ["other/00000000-0000-4000-8000-000000000000.webp"] }],
  ])("refuses %s", (_label, change) => {
    expect(createProductInput.safeParse({ ...valid, ...change }).success).toBe(false);
  });
});

describe("photos", () => {
  it("takes keys our upload made", () => {
    expect(createProductInput.parse({ ...valid, images: [photo] }).images).toEqual([photo]);
  });
});

describe("updateProductInput", () => {
  it("takes one field, and null clears the note", () => {
    expect(updateProductInput.parse({ note: null })).toEqual({ note: null });
  });

  it("takes sizes alone, and checks them against a category sent with them", () => {
    expect(updateProductInput.parse({ sizes: ["42"] })).toEqual({ sizes: ["42"] });
    expect(updateProductInput.safeParse({ category: "men", sizes: ["42"] }).success).toBe(false);
  });

  it("refuses an empty change and a change to the code", () => {
    expect(updateProductInput.safeParse({}).success).toBe(false);
    expect(updateProductInput.safeParse({ code: "SM-1" }).success).toBe(false);
  });
});

describe("listProductsInput", () => {
  it("defaults to the first 20", () => {
    expect(listProductsInput.parse({})).toEqual({ page: 1, limit: 20 });
  });

  it.each([
    ["page 0", { page: "0" }],
    ["a word for a page", { page: "two" }],
    ["limit 101", { limit: "101" }],
    ["limit 0", { limit: "0" }],
    ["a sort", { sort: "newest" }],
    ["an unknown category", { category: "campus" }],
  ])("refuses %s", (_label, query) => {
    expect(listProductsInput.safeParse(query).success).toBe(false);
  });
});
