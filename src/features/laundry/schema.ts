import { z } from "zod";

import { photoKey, text } from "@/features/products/schema";
import { laundryCategoryIds } from "@/lib/db/schema";

/* What the laundry API accepts. Strict: unknown fields, `id` included, are refused. */

/** Ids from the migration ("basket-small") and new ones (a UUID). */
export const laundryItemId = z.string().regex(/^[a-z0-9-]{1,64}$/);

const price = z.number().int().min(1).max(100_000);

/** Only an Unsplash id we already use or a key our upload made, never a link. */
const image = z.union([z.string().regex(/^photo-\d+-[0-9a-f]+$/), photoKey]);

const fields = z.object({
  name: text(80),
  desc: text(200),
  price,
  mark: text(8).nullable(),
  image,
});

export const createLaundryItemInput = fields
  .extend({ category: z.enum(laundryCategoryIds) })
  .strict();

export const updateLaundryItemInput = fields
  .partial()
  .strict()
  .refine((patch) => Object.keys(patch).length > 0);

/** Prices by item id, saved together. */
export const updateLaundryPricesInput = z
  .record(laundryItemId, price)
  .refine((prices) => Object.keys(prices).length > 0);

export type CreateLaundryItemInput = z.infer<typeof createLaundryItemInput>;
export type UpdateLaundryItemInput = z.infer<typeof updateLaundryItemInput>;
export type UpdateLaundryPricesInput = z.infer<typeof updateLaundryPricesInput>;
