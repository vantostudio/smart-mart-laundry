/* Neon has no CDN and phone photos run to 10MB, so photos shrink in the browser before upload. */

const LONGEST_SIDE = 1600;
const QUALITY = 0.8;
/** Cards show a photo about 240px wide at most, so 480 stays sharp on a phone screen. */
const THUMBNAIL_SIDE = 480;
const THUMBNAIL_QUALITY = 0.7;

/** A size that fits the longest side, never larger than the original. */
export function fitWithin(width: number, height: number, longest = LONGEST_SIDE) {
  const scale = Math.min(1, longest / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** A WebP, or JPEG where the browser can't write WebP (Safari answers with a big PNG). */
async function draw(bitmap: ImageBitmap, longest: number, quality: number): Promise<Blob> {
  const size = fitWithin(bitmap.width, bitmap.height, longest);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, size.width, size.height);

  const webp = await encode(canvas, "image/webp", quality);
  if (webp?.type === "image/webp") return webp;
  const jpeg = await encode(canvas, "image/jpeg", quality);
  if (!jpeg) throw new Error("The browser couldn't encode the photo");
  return jpeg;
}

/** The photo to keep and a small copy for grids and the bag, both from one decode. */
export async function shrinkImage(file: File): Promise<{ photo: Blob; thumbnail: Blob }> {
  const bitmap = await createImageBitmap(file);
  try {
    return {
      photo: await draw(bitmap, LONGEST_SIDE, QUALITY),
      thumbnail: await draw(bitmap, THUMBNAIL_SIDE, THUMBNAIL_QUALITY),
    };
  } finally {
    bitmap.close();
  }
}
