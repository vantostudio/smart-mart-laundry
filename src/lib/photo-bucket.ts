/* Plain, no imports and no env: Wrangler bundles it into the Worker entry. */

/** A photo's address in Neon Object Storage, path-style. The bucket is declared in `neon.ts`. */
export function bucketObjectUrl(endpoint: string, key: string): string {
  return `${endpoint.replace(/\/$/, "")}/products/${key}`;
}
