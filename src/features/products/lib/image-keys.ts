/* A plain module: the server and the browser both need it. */

/** Where a photo's thumbnail lives. Always this key, whatever format either file is. */
export function thumbnailKey(photoKey: string): string {
  return photoKey.replace(/\.[a-z]+$/, "-thumb");
}
