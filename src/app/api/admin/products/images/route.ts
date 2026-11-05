import { apiMessages } from "@/features/admin/messages";
import { thumbnailKey } from "@/features/products/lib/image-keys";
import { imageTypeOf } from "@/features/products/lib/image-type";
import { adminRoute } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { productImageUrl, putObject } from "@/lib/storage";

/** The browser shrinks a photo to about 200KB first, so this is only ever a safety limit. */
const MAX_BYTES = 2 * 1024 * 1024;
/** A thumbnail is about 40KB. */
const MAX_THUMBNAIL_BYTES = 100 * 1024;

/** One image field of the form, checked by its bytes. */
async function imageFrom(form: FormData | null, name: string, maxBytes: number) {
  const file = form?.get(name);
  if (!file || typeof file === "string") throw new AppError("VALIDATION", apiMessages.photoInvalid);
  if (file.size > maxBytes) throw new AppError("VALIDATION", apiMessages.photoTooBig);
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = imageTypeOf(bytes);
  if (!type) throw new AppError("VALIDATION", apiMessages.photoInvalid);
  return { bytes, type };
}

/**
 * Stores one photo and its thumbnail under keys we choose, and answers the photo's key to save on
 * the product. The thumbnail's key follows from it.
 */
export const POST = adminRoute(
  async ({ request }) => {
    const form = await request.formData().catch(() => null);
    const photo = await imageFrom(form, "file", MAX_BYTES);
    const thumbnail = await imageFrom(form, "thumbnail", MAX_THUMBNAIL_BYTES);
    // The browser writes WebP or JPEG; a PNG here would be far bigger than a thumbnail should be.
    if (thumbnail.type.extension === "png") {
      throw new AppError("VALIDATION", apiMessages.photoInvalid);
    }

    const key = `products/${crypto.randomUUID()}.${photo.type.extension}`;
    await putObject(thumbnailKey(key), thumbnail.bytes, thumbnail.type.contentType);
    await putObject(key, photo.bytes, photo.type.contentType);
    return Response.json({ key, url: productImageUrl(key) }, { status: 201 });
  },
  { limit: "upload" },
);
