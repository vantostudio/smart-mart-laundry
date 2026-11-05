import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import type { Product } from "../lib/products";
import { ProductList } from "./product-list";

const product: Product = {
  id: "p1",
  code: "SM-1001",
  name: "Linen dress",
  category: "ladies",
  condition: "mtumba",
  price: 800,
  sizes: ["M"],
  stock: 1,
  images: ["products/a.webp"],
  note: null,
  createdAt: "2026-11-05T00:00:00.000Z",
};

const photoUrl = (key: string) => `https://photos.test/${key}`;

function show(
  items: Product[],
  options: { total?: number; page?: number; view?: Record<string, string> } = {},
) {
  const { total = items.length, page = 1, view = {} } = options;
  return render(
    <ProductList
      result={{ items, page, limit: 20, total }}
      view={{ page, ...view }}
      photoUrl={photoUrl}
    />,
  );
}

const link = (name: string | RegExp) => screen.getByRole("link", { name });

describe("ProductList", () => {
  it("shows a product and opens it for editing", () => {
    show([product]);
    const card = link(/Linen dress/);
    expect(card).toHaveAttribute("href", "/admin/products/p1/edit");
    expect(within(card).getByText("SM-1001")).toBeInTheDocument();
    expect(within(card).getByText("Ladies wear")).toBeInTheDocument();
    expect(within(card).getByText("Mtumba")).toBeInTheDocument();
    expect(within(card).getByText("1 in stock")).toBeInTheDocument();
    expect(card.querySelector("img")).toHaveAttribute("src", "https://photos.test/products/a.webp");
  });

  it("says when a product is out of stock or has no photo", () => {
    show([{ ...product, stock: 0, images: [] }]);
    expect(screen.getByText("Out of stock")).toBeInTheDocument();
    expect(screen.getByText("No photo")).toBeInTheDocument();
  });

  it("invites the first product when there are none", () => {
    show([]);
    expect(screen.getByText("No products yet. Add your first one.")).toBeInTheDocument();
    expect(link("Add product")).toHaveAttribute("href", "/admin/products/new");
    expect(screen.queryByRole("link", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  it("offers to clear filters that match nothing", () => {
    show([], { view: { category: "shoes" } });
    expect(link("Clear filters")).toHaveAttribute("href", "/admin/products");
  });

  it("offers the first page when the page is past the end", () => {
    show([], { total: 3, page: 9 });
    expect(link("Go to the first page")).toHaveAttribute("href", "/admin/products");
  });

  it("keeps the filters in the page links", () => {
    show([product], { total: 45, page: 2, view: { category: "shoes" } });
    expect(screen.getByText("Page 2 of 3 · 45 products")).toBeInTheDocument();
    expect(link("Previous")).toHaveAttribute("href", "/admin/products?category=shoes");
    expect(link("Next")).toHaveAttribute("href", "/admin/products?category=shoes&page=3");
  });

  it("has no link past either end", () => {
    show([product]);
    expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
  });

  it("marks the current filter, and changing one goes back to page 1", () => {
    show([product], { total: 45, page: 2, view: { condition: "new" } });
    const conditions = within(screen.getByRole("navigation", { name: "Filter by condition" }));
    expect(conditions.getByRole("link", { name: "New" })).toHaveAttribute("aria-current", "true");
    const categories = within(screen.getByRole("navigation", { name: "Filter by category" }));
    expect(categories.getByRole("link", { name: "Shoes" })).toHaveAttribute(
      "href",
      "/admin/products?category=shoes&condition=new",
    );
  });
});
