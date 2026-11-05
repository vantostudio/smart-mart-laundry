import type { ProductCategory } from "@/lib/db/schema";

/*
 * The only sizes a product can have, so "m" and "M" can't both exist. Staff tick them, and the API
 * refuses anything else. Client components import this, so types only from the database schema.
 */

const clothes = ["XS", "S", "M", "L", "XL", "XXL"];
const ages = ["2–3 yrs", "4–5 yrs", "6–8 yrs", "9–11 yrs", "12–14 yrs"];
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => String(from + i));

export type SizeGroup = { label?: string; sizes: readonly string[] };

export const sizeGroups: Record<ProductCategory, readonly SizeGroup[]> = {
  ladies: [{ sizes: clothes }],
  men: [{ sizes: clothes }],
  kids: [
    { label: "Age", sizes: ages },
    { label: "Shoe size", sizes: range(19, 35) },
  ],
  shoes: [{ sizes: range(36, 46) }],
};

export function sizesFor(category: ProductCategory): string[] {
  return sizeGroups[category].flatMap((group) => [...group.sizes]);
}

const allSizes = new Set(
  Object.values(sizeGroups)
    .flat()
    .flatMap((group) => [...group.sizes]),
);

export function isKnownSize(size: string): boolean {
  return allSizes.has(size);
}

/** `sizes` that belong to `category`, in the order they're listed. */
export function keepSizes(sizes: readonly string[], category: ProductCategory): string[] {
  return sizesFor(category).filter((size) => sizes.includes(size));
}
