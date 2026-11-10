import type { Route } from "next";

import type { ProductCategory, ProductCondition } from "@/lib/db/schema";

export type ProductsView = {
  page?: number | undefined;
  category?: ProductCategory | undefined;
  condition?: ProductCondition | undefined;
};

/** The list's URL for a view. The first page and "all" are left out, so links stay short. */
export function productsHref({ page, category, condition }: ProductsView): Route {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (condition) params.set("condition", condition);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return (query ? `/admin/products?${query}` : "/admin/products") as Route;
}

export function editProductHref(id: string): Route {
  return `/admin/products/${id}/edit` as Route;
}
