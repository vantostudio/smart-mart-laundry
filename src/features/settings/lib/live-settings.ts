import "server-only";

import { cacheLife, cacheTag } from "next/cache";

import { defaultShopSettings, type ShopSettings } from "@/config/shop-settings";
import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { withTimeout } from "@/lib/timeout";

import { getShopSettings } from "./settings";

const READ_TIMEOUT_MS = 4000;

/**
 * The saved shop settings, cached on the server. Saving them calls `revalidateTag("settings")`, so
 * an edit shows on the next request; `hours` is only the backstop. If the database is unreachable
 * or has no env (builds, checks), the page gets the code defaults, and that answer is kept for
 * seconds, not hours, so the live values return as soon as the database does. Never throws: the
 * site doesn't depend on the database to render.
 */
export async function getLiveShopSettings(): Promise<ShopSettings> {
  "use cache";
  cacheTag(cacheTags.settings);
  try {
    const settings = await withTimeout(getShopSettings(getDb()), READ_TIMEOUT_MS);
    cacheLife("hours");
    return settings;
  } catch (error) {
    // Missing env is the normal state at build time; anything else is worth a log line.
    if (!(error instanceof AppError && error.code === "AUTH_UNAVAILABLE")) {
      log.warn("Shop settings unavailable, using defaults", { requestId: "cache", error });
    }
    // 5 minutes stale and an hour to expire keep this in the prerender; 30s to revalidate.
    cacheLife({ stale: 300, revalidate: 30, expire: 3600 });
    return defaultShopSettings;
  }
}
