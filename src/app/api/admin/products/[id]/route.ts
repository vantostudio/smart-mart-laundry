import { revalidateTag } from "next/cache";

import { apiMessages } from "@/features/admin/messages";
import { deleteProduct, getProduct, updateProduct } from "@/features/products/lib/products";
import { productId, updateProductInput } from "@/features/products/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

/** A malformed id can't be a product, and Postgres would refuse it. */
async function idFrom(context: Context): Promise<string> {
  const { id } = await context.params;
  if (!productId.safeParse(id).success) {
    throw new AppError("NOT_FOUND", apiMessages.productNotFound);
  }
  return id;
}

export const GET = adminRoute<Context>(async ({ context }) =>
  Response.json(await getProduct(getDb(), await idFrom(context))),
);

export const PATCH = adminRoute<Context>(async ({ request, context }) => {
  const id = await idFrom(context);
  const patch = await parseBody(request, updateProductInput);
  const updated = await updateProduct(getDb(), id, patch);
  revalidateTag(cacheTags.products, { expire: 0 });
  return Response.json(updated);
});

export const DELETE = adminRoute<Context>(async ({ context }) => {
  await deleteProduct(getDb(), await idFrom(context));
  revalidateTag(cacheTags.products, { expire: 0 });
  return new Response(null, { status: 204 });
});
