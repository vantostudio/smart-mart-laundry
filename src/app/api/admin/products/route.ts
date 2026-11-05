import { createProduct, listProducts } from "@/features/products/lib/products";
import { createProductInput, listProductsInput } from "@/features/products/schema";
import { adminRoute, parseBody, parseQuery } from "@/lib/api";
import { getDb } from "@/lib/db";

export const GET = adminRoute(async ({ request }) =>
  Response.json(await listProducts(getDb(), parseQuery(request, listProductsInput))),
);

export const POST = adminRoute(async ({ request }) => {
  const input = await parseBody(request, createProductInput);
  return Response.json(await createProduct(getDb(), input), { status: 201 });
});
