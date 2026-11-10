import { revalidateTag } from "next/cache";

import { apiMessages } from "@/features/admin/messages";
import { removePhotos } from "@/features/products/lib/photos";
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
  const db = getDb();
  // Only a patch that sets `images` can drop a photo, so only then is the old list needed.
  const before = patch.images ? (await getProduct(db, id)).images : [];
  const updated = await updateProduct(db, id, patch);
  revalidateTag(cacheTags.products, { expire: 0 });
  await removePhotos(
    db,
    before.filter((key) => !updated.images.includes(key)),
  );
  return Response.json(updated);
});

export const DELETE = adminRoute<Context>(async ({ context }) => {
  const db = getDb();
  const images = await deleteProduct(db, await idFrom(context));
  revalidateTag(cacheTags.products, { expire: 0 });
  await removePhotos(db, images);
  return new Response(null, { status: 204 });
});
