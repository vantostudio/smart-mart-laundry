import { asc, eq, inArray, sql, and, max } from "drizzle-orm";

import { apiMessages } from "@/features/admin/messages";
import { thumbnailKey } from "@/features/products/lib/image-keys";
import { laundryItem, type LaundryItemRow } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import { AppError } from "@/lib/errors";

import type { LaundryItem } from "../data";
import type {
  CreateLaundryItemInput,
  UpdateLaundryItemInput,
  UpdateLaundryPricesInput,
} from "../schema";

/** Builds a photo's address. Passed in so this file needs no storage config. */
type PhotoUrl = (key: string) => string;

/** A photo our upload stored, rather than an Unsplash id. */
export const isUploadedPhoto = (image: string) => image.startsWith("products/");

const notFound = () => new AppError("NOT_FOUND", apiMessages.laundryItemNotFound);

/** What shoppers see. An uploaded photo shows as its small thumbnail. */
function toLaundryItem(row: LaundryItemRow, photoUrl: PhotoUrl): LaundryItem {
  const { id, category, name, description, price, image, mark } = row;
  const shown = isUploadedPhoto(image) ? photoUrl(thumbnailKey(image)) : image;
  return { id, category, name, desc: description, price, image: shown, mark };
}

/** Every item, in page order. */
export async function listLaundryItems(db: Db, photoUrl: PhotoUrl): Promise<LaundryItem[]> {
  const rows = await db.select().from(laundryItem).orderBy(asc(laundryItem.position));
  return rows.map((row) => toLaundryItem(row, photoUrl));
}

export async function getLaundryItem(db: Db, id: string): Promise<LaundryItemRow> {
  const [row] = await db.select().from(laundryItem).where(eq(laundryItem.id, id)).limit(1);
  if (!row) throw notFound();
  return row;
}

/** Adds an item after all the others. */
export async function createLaundryItem(
  db: Db,
  { desc, ...input }: CreateLaundryItemInput,
): Promise<LaundryItemRow> {
  const [last] = await db.select({ position: max(laundryItem.position) }).from(laundryItem);
  const [row] = await db
    .insert(laundryItem)
    .values({
      ...input,
      id: crypto.randomUUID(),
      description: desc,
      position: (last?.position ?? 0) + 1,
    })
    .returning();
  return row!;
}

export async function updateLaundryItem(
  db: Db,
  id: string,
  { desc, ...patch }: UpdateLaundryItemInput,
): Promise<LaundryItemRow> {
  const [row] = await db
    .update(laundryItem)
    .set({ ...patch, ...(desc === undefined ? {} : { description: desc }) })
    .where(eq(laundryItem.id, id))
    .returning();
  if (!row) throw notFound();
  return row;
}

/**
 * Deletes an item and answers its photo. Every group keeps one item, so the laundry page and its
 * price list always have something to show; one statement, as Neon's HTTP driver has no transactions.
 */
export async function deleteLaundryItem(db: Db, id: string): Promise<string> {
  const [row] = await db
    .delete(laundryItem)
    .where(
      and(
        eq(laundryItem.id, id),
        sql`(select count(*) from laundry_item other where other.category = laundry_item.category) > 1`,
      ),
    )
    .returning({ image: laundryItem.image });
  if (row) return row.image;
  await getLaundryItem(db, id); // Throws if it was never there.
  throw new AppError("VALIDATION", apiMessages.lastLaundryItem);
}

/** Saves the prices sent, all or none. */
export async function setLaundryPrices(db: Db, prices: UpdateLaundryPricesInput): Promise<void> {
  const ids = Object.keys(prices);
  const known = await db
    .select({ id: laundryItem.id })
    .from(laundryItem)
    .where(inArray(laundryItem.id, ids));
  if (known.length !== ids.length) throw notFound();
  const cases = Object.entries(prices).map(
    ([id, price]) => sql`when ${laundryItem.id} = ${id} then ${price}::integer`,
  );
  await db
    .update(laundryItem)
    .set({ price: sql`case ${sql.join(cases, sql` `)} end` })
    .where(inArray(laundryItem.id, ids));
}
