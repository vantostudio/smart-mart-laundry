import { describe, expect, it } from "vite-plus/test";

import { emptyFilters, filterParams, parseFilters, type Filters } from "./filters";

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
    expect(
      parseFilters(new URLSearchParams("cat=hats&cond=used&size=huge&price=free&sort=newest")),
    ).toEqual(emptyFilters);
  });

  it("drops a size the chosen aisle doesn't have, so the API isn't asked for it", () => {
    expect(parseFilters(new URLSearchParams("cat=shoes&size=M")).size).toBeNull();
    expect(parseFilters(new URLSearchParams("size=M")).size).toBe("M");
  });
});
