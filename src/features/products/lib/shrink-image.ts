/* Neon has no CDN and phone photos run to 10MB, so photos shrink in the browser before upload. */

const LONGEST_SIDE = 1600;
const QUALITY = 0.8;

/** A size that fits the longest side, never larger than the original. */
export function fitWithin(width: number, height: number, longest = LONGEST_SIDE) {
  const scale = Math.min(1, longest / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function encode(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

/** A smaller WebP, or JPEG where the browser can't write WebP (Safari answers with a big PNG). */
export async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const size = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, size.width, size.height);
  bitmap.close();

  const webp = await encode(canvas, "image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await encode(canvas, "image/jpeg");
  if (!jpeg) throw new Error("The browser couldn't encode the photo");
  return jpeg;
}
