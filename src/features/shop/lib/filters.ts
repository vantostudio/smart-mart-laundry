import { sizeChoices } from "@/features/products/sizes";
import { priceBands, type PriceBand, type SortId } from "@/features/products/public";
import { shopCategories } from "@/features/shop/data";
import type { ProductCategory, ProductCondition } from "@/lib/db/schema";

export const sortOptions: readonly { id: SortId; label: string }[] = [
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
];

export type Filters = {
  q: string;
  cat: ProductCategory | null;
  cond: ProductCondition | null;
  size: string | null;
  price: PriceBand | null;
  /** Null keeps the shop's order, newest first. */
  sort: SortId | null;
};

export const emptyFilters: Filters = {
  q: "",
  cat: null,
  cond: null,
  size: null,
  price: null,
  sort: null,
};

type Params = Pick<URLSearchParams, "get"> | null;

const oneOf = <T extends string>(value: string | null | undefined, ids: readonly T[]) =>
  ids.find((id) => id === value) ?? null;

/** Reads filters from the URL, ignoring anything unknown. */
export function parseFilters(params: Params): Filters {
  const cat = oneOf(
    params?.get("cat"),
    shopCategories.map((c) => c.id),
  );
  return {
    q: params?.get("q")?.slice(0, 80) ?? "",
    cat,
    cond: oneOf(params?.get("cond"), ["mtumba", "new"] as const),
    size: oneOf(params?.get("size"), sizeChoices(cat)),
    price: oneOf(
      params?.get("price"),
      priceBands.map((b) => b.id),
    ),
    sort: oneOf(
      params?.get("sort"),
      sortOptions.map((s) => s.id),
    ),
  };
}

/** URL params for the filters, leaving out defaults so links stay short. */
export function filterParams(filters: Filters): [string, string][] {
  const out: [string, string][] = [];
  if (filters.q.trim()) out.push(["q", filters.q.trim()]);
  if (filters.cat) out.push(["cat", filters.cat]);
  if (filters.cond) out.push(["cond", filters.cond]);
  if (filters.size) out.push(["size", filters.size]);
  if (filters.price) out.push(["price", filters.price]);
  if (filters.sort) out.push(["sort", filters.sort]);
  return out;
}

/** How many narrowing filters are on (search and sort don't count). */
export const activeFilterCount = (f: Filters) =>
  [f.cat, f.cond, f.size, f.price].filter(Boolean).length;
