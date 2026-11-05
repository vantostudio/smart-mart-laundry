import { describe, expect, it } from "vite-plus/test";

import { editProductHref, productsHref } from "./links";

describe("productsHref", () => {
  it("leaves out the first page and empty filters", () => {
    expect(productsHref({})).toBe("/admin/products");
    expect(productsHref({ page: 1 })).toBe("/admin/products");
  });

  it("keeps filters and the page together", () => {
    expect(productsHref({ category: "shoes", condition: "new", page: 3 })).toBe(
      "/admin/products?category=shoes&condition=new&page=3",
    );
  });
});

describe("editProductHref", () => {
  it("points at the product", () => {
    expect(editProductHref("abc")).toBe("/admin/products/abc/edit");
  });
});
