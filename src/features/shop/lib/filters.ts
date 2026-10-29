import {
  categoryName,
  type Condition,
  type Product,
  type ShopCategoryId,
  shopCategories,
} from "@/features/shop/data";

export const priceBands = [
  { id: "under-500", label: "Under KSh 500", min: 0, max: 499 },
  { id: "500-1000", label: "KSh 500–1,000", min: 500, max: 1000 },
  { id: "1000-2000", label: "KSh 1,000–2,000", min: 1001, max: 2000 },
  { id: "2000-plus", label: "Over KSh 2,000", min: 2001, max: Infinity },
] as const;

type PriceBand = (typeof priceBands)[number]["id"];

export const sortOptions = [
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
] as const;

export type SortId = (typeof sortOptions)[number]["id"];

export type Filters = {
  q: string;
  cat: ShopCategoryId | null;
  cond: Condition | null;
  size: string | null;
  price: PriceBand | null;
  sort: SortId;
};

export const emptyFilters: Filters = {
  q: "",
  cat: null,
  cond: null,
  size: null,
  price: null,
  sort: "newest",
};

type Params = Pick<URLSearchParams, "get"> | null;

const oneOf = <T extends string>(value: string | null | undefined, ids: readonly T[]) =>
  ids.find((id) => id === value) ?? null;

/** Reads filters from the URL, ignoring anything unknown. */
export function parseFilters(params: Params): Filters {
  return {
    q: params?.get("q")?.slice(0, 80) ?? "",
    cat: oneOf(
      params?.get("cat"),
      shopCategories.map((c) => c.id),
    ),
    cond: oneOf(params?.get("cond"), ["mtumba", "new"] as const),
    size: params?.get("size")?.slice(0, 12) || null,
    price: oneOf(
      params?.get("price"),
      priceBands.map((b) => b.id),
    ),
    sort:
      oneOf(
        params?.get("sort"),
        sortOptions.map((s) => s.id),
      ) ?? "newest",
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
  if (filters.sort !== "newest") out.push(["sort", filters.sort]);
  return out;
}

/** How many narrowing filters are on (search and sort don't count). */
export const activeFilterCount = (f: Filters) =>
  [f.cat, f.cond, f.size, f.price].filter(Boolean).length;

/** Lowercase, accents and apostrophes stripped, other punctuation to spaces: "Levi's" → "levis". */
const normalise = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();

function haystack(p: Product) {
  const condition = p.condition === "mtumba" ? "mtumba second hand" : "new brand new";
  return normalise(
    [
      p.name,
      p.brand,
      p.colour,
      p.code,
      p.code.replace("-", ""),
      categoryName(p.category),
      condition,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

/** Every word of the search has to appear (as the start of a word) in the product's text. */
function matchesSearch(p: Product, q: string) {
  const words = normalise(q).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  const text = ` ${haystack(p)}`;
  return words.every((w) => text.includes(` ${w}`));
}

const LETTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/** Letters in garment order, then ages, then numbers ascending. */
export function compareSizes(a: string, b: string) {
  const rank = (s: string) => {
    const letter = LETTER_SIZES.indexOf(s);
    if (letter >= 0) return [0, letter];
    if (/yrs$/.test(s)) return [1, parseFloat(s)];
    return [2, parseFloat(s)];
  };
  const [ga = 0, va = 0] = rank(a);
  const [gb = 0, vb = 0] = rank(b);
  return ga - gb || va - vb;
}

/** Sizes on offer within a category (or everywhere), for the size filter. */
export function sizeOptions(products: readonly Product[], cat: ShopCategoryId | null) {
  const sizes = new Set(products.filter((p) => !cat || p.category === cat).flatMap((p) => p.sizes));
  return [...sizes].sort(compareSizes);
}

export function filterProducts(products: readonly Product[], f: Filters): Product[] {
  const band = priceBands.find((b) => b.id === f.price);
  const list = products.filter(
    (p) =>
      (!f.cat || p.category === f.cat) &&
      (!f.cond || p.condition === f.cond) &&
      (!f.size || p.sizes.includes(f.size)) &&
      (!band || (p.price >= band.min && p.price <= band.max)) &&
      matchesSearch(p, f.q),
  );
  const by: Record<SortId, (a: Product, b: Product) => number> = {
    newest: (a, b) => b.added.localeCompare(a.added),
    "price-asc": (a, b) => a.price - b.price || b.added.localeCompare(a.added),
    "price-desc": (a, b) => b.price - a.price || b.added.localeCompare(a.added),
  };
  return list.sort(by[f.sort]);
}
