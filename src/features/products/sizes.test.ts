import { describe, expect, it } from "vite-plus/test";

import { isKnownSize, keepSizes, sizesFor } from "./sizes";

describe("sizes", () => {
  it("lists what each category sells", () => {
    expect(sizesFor("ladies")).toEqual(["XS", "S", "M", "L", "XL", "XXL"]);
    expect(sizesFor("shoes")).toContain("42");
  });

  it("is exact about case", () => {
    expect(isKnownSize("M")).toBe(true);
    expect(isKnownSize("m")).toBe(false);
  });

  it("keeps sizes in list order, whatever order they were ticked", () => {
    expect(keepSizes(["XL", "S"], "men")).toEqual(["S", "XL"]);
  });

  it("drops what the category doesn't have", () => {
    expect(keepSizes(["M", "42"], "shoes")).toEqual(["42"]);
  });
});
