import { z } from "zod";

import { productCategories, productConditions, type ProductCategory } from "@/lib/db/schema";

import { MAX_PHOTOS } from "./limits";
import { priceBandIds, sortIds } from "./public";
import { isKnownSize, sizesFor } from "./sizes";

/* What the products API accepts. Strict: unknown fields, `id` and `code` included, are refused. */

/** Postgres `integer`. */
const MAX_INT = 2_147_483_647;
/** Beyond this the offset is meaningless, and it stays a safe number. */
const MAX_PAGE = 1_000_000;

const MAX_LIMIT = 100;
/** The shop asks for 12 at a time; this stops anyone pulling the whole catalogue in one request. */
const MAX_PUBLIC_LIMIT = 48;

/** Postgres text can't hold a NUL byte. */
export const text = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .regex(/^[^\0]*$/);

/** Only keys our upload made, never a link: `productImageUrl` builds the URL. */
export const photoKey = z.string().regex(/^products\/[0-9a-f-]{36}\.(webp|jpg|png)$/);

const amount = z.number().int().min(0).max(MAX_INT);

const fields = z.object({
  name: text(200),
  category: z.enum(productCategories),
  condition: z.enum(productConditions),
  /** Whole KSh. */
  price: amount,
  stock: amount,
  sizes: z.array(z.string().refine(isKnownSize)).max(40),
  images: z.array(photoKey).max(MAX_PHOTOS),
  note: text(1000).nullable(),
});

/** When both are sent, the sizes must be ones that category has. */
function sizesFitCategory(input: { category?: ProductCategory; sizes?: string[] }): boolean {
  const { category, sizes } = input;
  return !category || !sizes || sizes.every((size) => sizesFor(category).includes(size));
}

const wrongSizes = { path: ["sizes"] };

export const createProductInput = fields
  .partial({ sizes: true, images: true, note: true })
  .strict()
  .refine(sizesFitCategory, wrongSizes);

export const updateProductInput = fields
  .partial()
  .strict()
  .refine((patch) => Object.keys(patch).length > 0)
  .refine(sizesFitCategory, wrongSizes);

export const listProductsInput = z
  .object({
    page: z.coerce.number().int().min(1).max(MAX_PAGE).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(20),
    category: z.enum(productCategories).optional(),
    condition: z.enum(productConditions).optional(),
  })
  .strict();

/** What the public shop may ask for. Strict, so a made-up parameter can't dodge the CDN cache. */
export const listPublicProductsInput = z
  .object({
    page: z.coerce.number().int().min(1).max(MAX_PAGE).default(1),
    limit: z.coerce.number().int().min(1).max(MAX_PUBLIC_LIMIT).default(12),
    q: z
      .string()
      .trim()
      .max(80)
      .regex(/^[^\0]*$/)
      .optional(),
    category: z.enum(productCategories).optional(),
    condition: z.enum(productConditions).optional(),
    size: z.string().refine(isKnownSize).optional(),
    price: z.enum(priceBandIds).optional(),
    sort: z.enum(sortIds).optional(),
  })
  .strict();

export const productCode = z
  .string()
  .regex(/^SM-\d{1,12}$/i)
  .transform((code) => code.toUpperCase());

export const productId = z.uuid();

export type CreateProductInput = z.output<typeof createProductInput>;
export type UpdateProductInput = z.output<typeof updateProductInput>;
export type ListProductsInput = z.output<typeof listProductsInput>;
export type ListPublicProductsInput = z.output<typeof listPublicProductsInput>;
