import "server-only";

import { arrayOverlaps } from "drizzle-orm";

import { product } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import { log } from "@/lib/log";
import { getRequestId } from "@/lib/request-id";
import { deleteObject } from "@/lib/storage";

import { thumbnailKey } from "./image-keys";

/**
 * Removes photos, and their thumbnails, that a product no longer uses. Call it after the database
 * change. A key some row still lists is kept. Storage trouble is logged and never thrown: the
 * product change has happened, and a stray file only costs space.
 */
export async function removePhotos(db: Db, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  const requestId = await getRequestId();
  try {
    const rows = await db
      .select({ images: product.images })
      .from(product)
      .where(arrayOverlaps(product.images, keys));
    const inUse = new Set(rows.flatMap((row) => row.images));
    const unused = keys.filter((key) => !inUse.has(key));
    const results = await Promise.allSettled(
      unused.flatMap((key) => [deleteObject(key), deleteObject(thumbnailKey(key))]),
    );
    for (const result of results) {
      if (result.status === "rejected") {
        const { name, code } = result.reason as { name?: string; code?: string };
        log.warn("photo_delete_failed", { requestId, error: name, code });
      }
    }
  } catch (err) {
    // The check couldn't run, so nothing is deleted: keeping a file is the safe side.
    log.warn("photo_delete_failed", {
      requestId,
      error: err instanceof Error ? err.name : "Error",
    });
  }
}
