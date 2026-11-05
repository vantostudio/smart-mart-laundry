import { z } from "zod";

import { productCategories, productConditions } from "@/lib/db/schema";

/* What the products API accepts. Strict: unknown fields, `id` and `code` included, are refused. */

/** Postgres `integer`. */
const MAX_INT = 2_147_483_647;
/** Beyond this the offset is meaningless, and it stays a safe number. */
const MAX_PAGE = 1_000_000;

export const MAX_LIMIT = 100;
export const MAX_PHOTOS = 6;

/** Postgres text can't hold a NUL byte. */
const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[^\0]*$/);

/** Only keys our upload made, never a link: `productImageUrl` builds the URL. */
const photoKey = z.string().regex(/^products\/[0-9a-f-]{36}\.(webp|jpg|png)$/);

const amount = z.number().int().min(0).max(MAX_INT);

const fields = z.object({
  name: text(200),
  category: z.enum(productCategories),
  condition: z.enum(productConditions),
  /** Whole KSh. */
  price: amount,
  stock: amount,
  sizes: z.array(text(30)).max(30),
  images: z.array(photoKey).max(MAX_PHOTOS),
  note: text(1000).nullable(),
});

export const createProductInput = fields
  .partial({ sizes: true, images: true, note: true })
  .strict();

export const updateProductInput = fields
  .partial()
  .strict()
  .refine((patch) => Object.keys(patch).length > 0);

export const listProductsInput = z
  .object({
    page: z.coerce.number().int().min(1).max(MAX_PAGE).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
    category: z.enum(productCategories).optional(),
    condition: z.enum(productConditions).optional(),
  })
  .strict();

export const productId = z.uuid();

export type CreateProductInput = z.output<typeof createProductInput>;
export type UpdateProductInput = z.output<typeof updateProductInput>;
export type ListProductsInput = z.output<typeof listProductsInput>;
