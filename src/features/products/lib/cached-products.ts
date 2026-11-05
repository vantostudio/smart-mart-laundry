import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { productImageUrl } from "@/lib/storage";
import { withTimeout } from "@/lib/timeout";

import type { PublicProduct } from "../public";
import { getPublicProduct, listInStockCodes } from "./products";

/*
 * What the server renders for search engines: a product's page and the sitemap. Both are cached and
 * tagged `products`, which every product write expires, so a sold-out piece leaves quickly; the
 * lifetime is only the backstop. A failure is never cached as an answer.
 */

const READ_TIMEOUT_MS = 4000;

/**
 * One in-stock product, or `null` when there is none (sold out, deleted or never existed). `null` is
 * a real answer, kept only briefly so guessed codes can't pile up in the cache. A database or
 * storage failure throws instead, which Next doesn't cache, so an outage can never turn into a
 * cached "not found".
 */
export async function getCachedPublicProduct(code: string): Promise<PublicProduct | null> {
  "use cache";
  cacheTag(cacheTags.products);
  try {
    const found = await withTimeout(
      getPublicProduct(getDb(), code, productImageUrl),
      READ_TIMEOUT_MS,
    );
    cacheLife("minutes");
    return found;
  } catch (error) {
    if (!(error instanceof AppError && error.code === "NOT_FOUND")) throw error;
    cacheLife({ stale: 30, revalidate: 30, expire: 300 });
    return null;
  }
}

/**
 * The codes in stock, for the sitemap. With no database (the build) or when it is down this gives
 * an empty list, kept for a minute, so the sitemap still lists the fixed pages and recovers fast.
 */
export async function getCachedSitemapCodes(): Promise<string[]> {
  "use cache";
  cacheTag(cacheTags.products);
  try {
    const codes = await withTimeout(listInStockCodes(getDb()), READ_TIMEOUT_MS);
    cacheLife("hours");
    return codes;
  } catch (error) {
    if (!(error instanceof AppError && error.code === "AUTH_UNAVAILABLE")) {
      log.warn("Sitemap products unavailable, listing fixed pages only", {
        requestId: "cache",
        error,
      });
    }
    cacheLife({ stale: 300, revalidate: 60, expire: 3600 });
    return [];
  }
}
