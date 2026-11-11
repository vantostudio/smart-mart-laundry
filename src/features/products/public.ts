import type { ProductCategory, ProductCondition } from "@/lib/db/schema";

/* What the public shop sees and can ask for. Client components import this: no server code. */

export type PublicProduct = {
  /** Printed on the tag and sent in the WhatsApp order, so staff find the exact piece. */
  code: string;
  name: string;
  category: ProductCategory;
  condition: ProductCondition;
  /** Whole KSh. */
  price: number;
  /** Empty for one-size items. */
  sizes: string[];
  stock: number;
  /** Public addresses (an https URL or a same-site path), first one is the main photo. Can be empty. */
  photos: string[];
  /**
   * The address (an https URL or a same-site path) of a small copy of the first photo, or null.
   * Photos from before thumbnails have none to find.
   */
  thumbnail: string | null;
  note: string | null;
};

export type PublicProductPage = {
  items: PublicProduct[];
  page: number;
  limit: number;
  /** Every match, not just this page. */
  total: number;
  /** Matches per aisle, ignoring the chosen aisle. */
  counts: Record<ProductCategory, number>;
};

export const priceBandIds = ["under-500", "500-1000", "1000-2000", "2000-plus"] as const;
export type PriceBand = (typeof priceBandIds)[number];

export const priceBands = [
  { id: "under-500", label: "Under KSh 500", min: 0, max: 499 },
  { id: "500-1000", label: "KSh 500–1,000", min: 500, max: 1000 },
  { id: "1000-2000", label: "KSh 1,000–2,000", min: 1001, max: 2000 },
  { id: "2000-plus", label: "Over KSh 2,000", min: 2001, max: Infinity },
] as const satisfies readonly { id: PriceBand; label: string; min: number; max: number }[];

export const sortIds = ["price-asc", "price-desc"] as const;
export type SortId = (typeof sortIds)[number];
