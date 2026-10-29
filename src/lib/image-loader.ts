import type { ImageLoaderProps } from "next/image";

/**
 * next/image loader. Every photo comes from Unsplash's CDN, which resizes and converts on request
 * (imgix), so ask it for the exact width, quality and best format directly instead of having the
 * Next server download the original and resize it.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (!src.startsWith("https://images.unsplash.com/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  return url.toString();
}
