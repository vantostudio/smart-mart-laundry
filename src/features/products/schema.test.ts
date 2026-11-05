import { describe, expect, it } from "vite-plus/test";

import { createProductInput, listProductsInput, updateProductInput } from "./schema";

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
    ["an unknown condition", { condition: "used" }],
    ["a negative price", { price: -1 }],
    ["a fractional price", { price: 1.5 }],
    ["a price too big for Postgres", { price: 2_147_483_648 }],
    ["negative stock", { stock: -1 }],
    ["an empty name", { name: "   " }],
    ["a NUL byte", { name: "a\0b" }],
    ["too many images", { images: Array.from({ length: 11 }, () => "a") }],
  ])("refuses %s", (_label, change) => {
    expect(createProductInput.safeParse({ ...valid, ...change }).success).toBe(false);
  });
});

describe("updateProductInput", () => {
  it("takes one field, and null clears the note", () => {
    expect(updateProductInput.parse({ note: null })).toEqual({ note: null });
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
