import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { productImageUrl } from "@/lib/storage";
import { withTimeout } from "@/lib/timeout";

import { laundryItems, type LaundryItem } from "../data";
import { listLaundryItems } from "./items";

const READ_TIMEOUT_MS = 4000;

/**
 * The saved laundry items, cached on the server, the same way as `getLiveShopSettings`. Saving one
 * expires the `laundry` tag. With no database (builds, checks) or an outage this gives the items in
 * `data.ts` for seconds, not hours. Never throws: the site doesn't depend on the database to render.
 */
export async function getLiveLaundryItems(): Promise<LaundryItem[]> {
  "use cache";
  cacheTag(cacheTags.laundry);
  try {
    const items = await withTimeout(listLaundryItems(getDb(), productImageUrl), READ_TIMEOUT_MS);
    cacheLife("hours");
    return items;
  } catch (error) {
    if (!(error instanceof AppError && error.code === "AUTH_UNAVAILABLE")) {
      log.warn("Laundry items unavailable, using defaults", { requestId: "cache", error });
    }
    cacheLife({ stale: 300, revalidate: 30, expire: 3600 });
    return laundryItems;
  }
}
