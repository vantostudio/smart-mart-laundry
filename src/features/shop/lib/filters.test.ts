import { describe, expect, it } from "vite-plus/test";

import { products } from "@/features/shop/data";

import {
  compareSizes,
  emptyFilters,
  filterParams,
  filterProducts,
  parseFilters,
  sizeOptions,
  type Filters,
} from "./filters";

const run = (f: Partial<Filters>) => filterProducts(products, { ...emptyFilters, ...f });
const codes = (f: Partial<Filters>) => run(f).map((p) => p.code);

describe("filterProducts", () => {
  it("matches every search word against name, brand, colour, category and code", () => {
    expect(run({ q: "denim" }).every((p) => /denim/i.test(p.name))).toBe(true);
    expect(codes({ q: "levis jacket" })).toEqual(["SM-1001"]);
    expect(codes({ q: "LEVI'S 501" })).toEqual(["SM-1204"]);
    expect(codes({ q: "sm-1305" })).toEqual(["SM-1305"]);
    expect(codes({ q: "sm1305" })).toEqual(["SM-1305"]);
    expect(run({ q: "shoes" }).length).toBeGreaterThan(5);
    expect(run({ q: "tuxedo" })).toEqual([]);
  });

  it("ignores accents and matches from the start of words", () => {
    expect(codes({ q: "décim" })).toEqual([]);
    expect(run({ q: "dénim" }).length).toBe(run({ q: "denim" }).length);
    // "ark" is inside "dark" but doesn't start a word.
    expect(run({ q: "ark" })).toEqual([]);
  });

  it("narrows by category, condition, size and price band", () => {
    expect(run({ cat: "shoes" }).every((p) => p.category === "shoes")).toBe(true);
    expect(run({ cond: "mtumba" }).every((p) => p.condition === "mtumba" && p.stock === 1)).toBe(
      true,
    );
    expect(run({ size: "42" }).every((p) => p.sizes.includes("42"))).toBe(true);
    expect(run({ price: "under-500" }).every((p) => p.price < 500)).toBe(true);
    expect(run({ price: "2000-plus" }).every((p) => p.price > 2000)).toBe(true);
    expect(codes({ cat: "men", cond: "mtumba", size: "32" })).toEqual(["SM-1204"]);
  });

  it("sorts newest first by default, or by price", () => {
    const newest = run({});
    const added = newest.map((p) => p.added);
    expect(added).toEqual([...added].sort().reverse());
    const cheap = run({ sort: "price-asc" }).map((p) => p.price);
    expect(cheap).toEqual([...cheap].sort((a, b) => a - b));
    const dear = run({ sort: "price-desc" }).map((p) => p.price);
    expect(dear).toEqual([...dear].sort((a, b) => b - a));
  });
});

describe("URL filters", () => {
  it("round-trips through the URL and drops defaults", () => {
    const f: Filters = {
      q: "white sneakers",
      cat: "shoes",
      cond: "new",
      size: "42",
      price: "2000-plus",
      sort: "price-asc",
    };
    expect(parseFilters(new URLSearchParams(filterParams(f)))).toEqual(f);
    expect(filterParams(emptyFilters)).toEqual([]);
  });

  it("ignores unknown values", () => {
    expect(parseFilters(new URLSearchParams("cat=hats&cond=used&price=free&sort=random"))).toEqual(
      emptyFilters,
    );
  });
});

describe("sizes", () => {
  it("orders letters, then ages, then numbers", () => {
    expect(["42", "M", "4–5 yrs", "XS", "38", "2–3 yrs", "XXL"].sort(compareSizes)).toEqual([
      "XS",
      "M",
      "XXL",
      "2–3 yrs",
      "4–5 yrs",
      "38",
      "42",
    ]);
  });

  it("offers only sizes stocked in the category", () => {
    expect(sizeOptions(products, "shoes")).not.toContain("M");
    expect(sizeOptions(products, "shoes")).toContain("42");
    expect(sizeOptions(products, "ladies")).toEqual(["S", "M", "L"]);
  });
});
