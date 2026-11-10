import { apiMessages } from "@/features/admin/messages";
import { getPublicProduct } from "@/features/products/lib/products";
import { productCode } from "@/features/products/schema";
import { publicRoute } from "@/lib/api";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { productImageUrl } from "@/lib/storage";

type Context = { params: Promise<{ code: string }> };

export const GET = publicRoute<Context>(async ({ context }) => {
  const code = productCode.safeParse((await context.params).code);
  // A code that can't exist reads the same as one that's gone.
  if (!code.success) throw new AppError("NOT_FOUND", apiMessages.productNotFound);
  return Response.json(await getPublicProduct(getDb(), code.data, productImageUrl));
});
