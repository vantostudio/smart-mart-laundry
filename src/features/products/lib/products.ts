import { and, count, desc, eq } from "drizzle-orm";

import { apiMessages } from "@/features/admin/messages";
import { product, type ProductRow } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import { AppError } from "@/lib/errors";

import type { CreateProductInput, ListProductsInput, UpdateProductInput } from "../schema";

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

export async function deleteProduct(db: Db, id: string): Promise<void> {
  const rows = await db.delete(product).where(eq(product.id, id)).returning({ id: product.id });
  if (rows.length === 0) throw notFound();
}
