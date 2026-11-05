import { revalidateTag } from "next/cache";

import { createProduct, listProducts } from "@/features/products/lib/products";
import { createProductInput, listProductsInput } from "@/features/products/schema";
import { adminRoute, parseBody, parseQuery } from "@/lib/api";
import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";

export const GET = adminRoute(async ({ request }) =>
  Response.json(await listProducts(getDb(), parseQuery(request, listProductsInput))),
);

export const POST = adminRoute(async ({ request }) => {
  const input = await parseBody(request, createProductInput);
  const created = await createProduct(getDb(), input);
  revalidateTag(cacheTags.products, { expire: 0 });
  return Response.json(created, { status: 201 });
});
