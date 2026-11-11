/* A plain module: the server, the browser and the Worker entry all use it. */

const PHOTO_KEY =
  /^products\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.(webp|jpg|png)|-thumb)$/;

/** Where a photo's thumbnail lives. Always this key, whatever format either file is. */
export function thumbnailKey(photoKey: string): string {
  return photoKey.replace(/\.[a-z]+$/, "-thumb");
}

/** True only for keys our upload makes: a photo or its thumbnail. The only keys `/photos/` serves. */
export function isPhotoKey(key: string): boolean {
  return PHOTO_KEY.test(key);
}

/** The same-site address of a photo. */
export function photoPath(key: string): string {
  return "/photos/" + key;
}
