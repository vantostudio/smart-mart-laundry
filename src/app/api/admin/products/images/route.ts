import { apiMessages } from "@/features/admin/messages";
import { imageTypeOf } from "@/features/products/lib/image-type";
import { adminRoute } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { productImageUrl, putObject } from "@/lib/storage";

/** The browser shrinks a photo to about 200KB first, so this is only ever a safety limit. */
const MAX_BYTES = 2 * 1024 * 1024;

async function photoFrom(request: Request): Promise<File> {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") throw new AppError("VALIDATION", apiMessages.photoInvalid);
  if (file.size > MAX_BYTES) throw new AppError("VALIDATION", apiMessages.photoTooBig);
  return file;
}

/** Stores one photo under a key we choose, and answers the key to save on the product. */
export const POST = adminRoute(
  async ({ request }) => {
    const file = await photoFrom(request);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = imageTypeOf(bytes);
    if (!type) throw new AppError("VALIDATION", apiMessages.photoInvalid);

    const key = `products/${crypto.randomUUID()}.${type.extension}`;
    await putObject(key, bytes, type.contentType);
    return Response.json({ key, url: productImageUrl(key) }, { status: 201 });
  },
  { limit: "upload" },
);
