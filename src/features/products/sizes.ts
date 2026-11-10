import type { ProductCategory } from "@/lib/db/schema";

/*
 * The only sizes a product can have, so "m" and "M" can't both exist. Staff tick them, and the API
 * refuses anything else. Client components import this, so types only from the database schema.
 */

const clothes = ["XS", "S", "M", "L", "XL", "XXL"];
const shoes = Array.from({ length: 11 }, (_, i) => String(36 + i));

const sizesByCategory: Record<ProductCategory, readonly string[]> = {
  ladies: clothes,
  men: clothes,
  shoes,
};

export function sizesFor(category: ProductCategory): readonly string[] {
  return sizesByCategory[category];
}

/** Sizes to filter by: one category's, or all of them. */
export function sizeChoices(category: ProductCategory | null): readonly string[] {
  return category ? sizesFor(category) : [...clothes, ...shoes];
}

export function isKnownSize(size: string): boolean {
  return clothes.includes(size) || shoes.includes(size);
}

/** `sizes` that belong to `category`, in the order they're listed. */
export function keepSizes(sizes: readonly string[], category: ProductCategory): string[] {
  return sizesFor(category).filter((size) => sizes.includes(size));
}
