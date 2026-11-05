import { listPublicProducts } from "@/features/products/lib/products";
import { listPublicProductsInput } from "@/features/products/schema";
import { parseQuery, publicRoute } from "@/lib/api";
import { getDb } from "@/lib/db";
import { productImageUrl } from "@/lib/storage";

export const GET = publicRoute(async ({ request }) =>
  Response.json(
    await listPublicProducts(
      getDb(),
      parseQuery(request, listPublicProductsInput),
      productImageUrl,
    ),
  ),
);
