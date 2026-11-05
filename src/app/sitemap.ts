import type { MetadataRoute } from "next";

import { siteNav } from "@/config/navigation";
import { site } from "@/config/site";
import { getCachedSitemapCodes } from "@/features/products/lib/cached-products";

const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
  url: new URL(path, site.url).toString(),
  changeFrequency: "weekly",
  priority,
});

/**
 * The fixed pages, then every product in stock at `/shop/<code>`. The products come from a cached
 * read tagged `products`, so the sitemap follows the shop: it works at build with no database
 * (fixed pages only) and refreshes when staff change a product. No `lastModified`: the table keeps
 * only a created date, and a wrong one is worse than none.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const codes = await getCachedSitemapCodes();
  return [
    ...["/", ...siteNav.map((l) => l.href)].map((path) => entry(path, path === "/" ? 1 : 0.7)),
    ...codes.map((code) => entry(`/shop/${code}`, 0.6)),
  ];
}
