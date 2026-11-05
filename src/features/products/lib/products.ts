import { and, arrayContains, asc, count, desc, eq, gt, gte, lte, sql, type SQL } from "drizzle-orm";

import { apiMessages } from "@/features/admin/messages";
import { product, productCategories, type ProductRow } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import { AppError } from "@/lib/errors";

import { thumbnailKey } from "./image-keys";
import { priceBands, type PublicProduct, type PublicProductPage } from "../public";
import type {
  CreateProductInput,
  ListProductsInput,
  ListPublicProductsInput,
  UpdateProductInput,
} from "../schema";

/*
 * Products in the database. Each function is one statement, or two reads for a page, because Neon's
 * HTTP driver has no transactions. Input is already validated by `../schema`.
 */

export type Product = Omit<ProductRow, "createdAt"> & { createdAt: string };

export type ProductPage = { items: Product[]; page: number; limit: number; total: number };

function toProduct({ createdAt, ...row }: ProductRow): Product {
  return { ...row, createdAt: createdAt.toISOString() };
}

function notFound(): AppError {
  return new AppError("NOT_FOUND", apiMessages.productNotFound);
}

/** One page, newest first. `id` breaks ties so a row can't appear on two pages. */
export async function listProducts(db: Db, input: ListProductsInput): Promise<ProductPage> {
  const { page, limit, category, condition } = input;
  const where = and(
    category === undefined ? undefined : eq(product.category, category),
    condition === undefined ? undefined : eq(product.condition, condition),
  );
  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(product)
      .where(where)
      .orderBy(desc(product.createdAt), desc(product.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ total: count() }).from(product).where(where),
  ]);
  return { items: rows.map(toProduct), page, limit, total: totals[0]?.total ?? 0 };
}

export async function getProduct(db: Db, id: string): Promise<Product> {
  const [row] = await db.select().from(product).where(eq(product.id, id)).limit(1);
  if (!row) throw notFound();
  return toProduct(row);
}

export async function createProduct(db: Db, input: CreateProductInput): Promise<Product> {
  const [row] = await db.insert(product).values(input).returning();
  return toProduct(row!);
}

export async function updateProduct(
  db: Db,
  id: string,
  patch: UpdateProductInput,
): Promise<Product> {
  const [row] = await db.update(product).set(patch).where(eq(product.id, id)).returning();
  if (!row) throw notFound();
  return toProduct(row);
}

/** Answers the photo keys it had, so the caller can remove them from storage. */
export async function deleteProduct(db: Db, id: string): Promise<string[]> {
  const rows = await db.delete(product).where(eq(product.id, id)).returning({
    images: product.images,
  });
  if (!rows[0]) throw notFound();
  return rows[0].images;
}

/** Builds a photo's public address. Passed in so this file needs no storage config. */
type PhotoUrl = (key: string) => string;

/** Only what shoppers see: no `id`, no date, and photo addresses rather than storage keys. */
function toPublicProduct(row: ProductRow, photoUrl: PhotoUrl): PublicProduct {
  const { code, name, category, condition, price, sizes, stock, images, note } = row;
  return {
    code,
    name,
    category,
    condition,
    price,
    sizes,
    stock,
    note,
    photos: images.map(photoUrl),
    thumbnail: images[0] ? photoUrl(thumbnailKey(images[0])) : null,
  };
}

const MAX_SEARCH_WORDS = 6;

/** `%` and `_` mean "anything" in ILIKE, so a search for "100%" has to escape them. */
const escapeLike = (word: string) => word.replace(/[\\%_]/g, "\\$&");

/** Every word has to start a word in the product's text, so "men" doesn't find "women's". */
function searchWhere(q: string | undefined): SQL[] {
  const words = q?.split(/\s+/).filter(Boolean).slice(0, MAX_SEARCH_WORDS) ?? [];
  const text = sql`' ' || concat_ws(' ', ${product.name}, ${product.code}, replace(${product.code}, '-', ''), ${product.category}, ${product.condition})`;
  return words.map((word) => sql`${text} ilike ${`% ${escapeLike(word)}%`}`);
}

function priceWhere(price: ListPublicProductsInput["price"]): SQL[] {
  const band = priceBands.find((b) => b.id === price);
  if (!band) return [];
  return [
    gte(product.price, band.min),
    ...(band.max === Infinity ? [] : [lte(product.price, band.max)]),
  ];
}

const publicOrder = {
  newest: [],
  "price-asc": [asc(product.price)],
  "price-desc": [desc(product.price)],
};

/**
 * One page for the shop: in stock only, newest first unless sorted by price. `counts` is per aisle
 * for the same search and filters, so the rail can dim an empty aisle; `total` comes from it, which
 * saves a third query.
 */
export async function listPublicProducts(
  db: Db,
  input: ListPublicProductsInput,
  photoUrl: PhotoUrl,
): Promise<PublicProductPage> {
  const { page, limit, q, category, condition, size, price, sort } = input;
  const everyAisle = and(
    gt(product.stock, 0),
    condition === undefined ? undefined : eq(product.condition, condition),
    size === undefined ? undefined : arrayContains(product.sizes, [size]),
    ...priceWhere(price),
    ...searchWhere(q),
  );
  const [rows, aisles] = await Promise.all([
    db
      .select()
      .from(product)
      .where(and(everyAisle, category === undefined ? undefined : eq(product.category, category)))
      .orderBy(...publicOrder[sort ?? "newest"], desc(product.createdAt), desc(product.id))
      .limit(limit)
      .offset((page - 1) * limit),
    db
      .select({ category: product.category, total: count() })
      .from(product)
      .where(everyAisle)
      .groupBy(product.category),
  ]);
  const counts = Object.fromEntries(
    productCategories.map((id) => [id, aisles.find((a) => a.category === id)?.total ?? 0]),
  ) as PublicProductPage["counts"];
  const total = category ? counts[category] : Object.values(counts).reduce((a, b) => a + b, 0);
  return {
    items: rows.map((row) => toPublicProduct(row, photoUrl)),
    page,
    limit,
    total,
    counts,
  };
}

/** One product by its tag code. Sold out reads the same as deleted: the shop can't sell it. */
export async function getPublicProduct(
  db: Db,
  code: string,
  photoUrl: PhotoUrl,
): Promise<PublicProduct> {
  const [row] = await db
    .select()
    .from(product)
    .where(and(eq(product.code, code), gt(product.stock, 0)))
    .limit(1);
  if (!row) throw notFound();
  return toPublicProduct(row, photoUrl);
}

/** The most addresses one sitemap file may hold. */
const SITEMAP_LIMIT = 50_000;

/** The codes of everything in stock, newest first, for the sitemap. */
export async function listInStockCodes(db: Db): Promise<string[]> {
  const rows = await db
    .select({ code: product.code })
    .from(product)
    .where(gt(product.stock, 0))
    .orderBy(desc(product.createdAt), desc(product.id))
    .limit(SITEMAP_LIMIT);
  return rows.map((r) => r.code);
}
