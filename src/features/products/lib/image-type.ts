export type ImageType = { contentType: string; extension: "webp" | "jpg" | "png" };

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  return signature.every((byte, i) => bytes[i + offset] === byte);
}

/** What a file really is, from its first bytes. The name and declared type can say anything. */
export function imageTypeOf(bytes: Uint8Array): ImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { contentType: "image/jpeg", extension: "jpg" };
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { contentType: "image/png", extension: "png" };
  }
  const isRiff = startsWith(bytes, [0x52, 0x49, 0x46, 0x46]);
  if (isRiff && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) {
    return { contentType: "image/webp", extension: "webp" };
  }
  return null;
}
