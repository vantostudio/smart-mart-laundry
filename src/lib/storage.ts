import "server-only";

import { AwsClient } from "aws4fetch";

import { storageEnv } from "@/config/env";

/*
 * Neon Object Storage, which speaks S3 with path-style URLs. `aws4fetch` signs a plain `fetch`, so
 * this runs on Workers. The bucket is declared in `neon.ts`: anyone can read, only we can write.
 */

const BUCKET = "products";

/** Carries only the status, for the log line. Neon's error body never leaves here. */
class StorageError extends Error {
  override name = "StorageError";
  readonly code: string;

  constructor(status: number) {
    super("Storage request failed");
    this.code = String(status);
  }
}

function objectUrl(key: string): string {
  return `${storageEnv().AWS_ENDPOINT_URL_S3.replace(/\/$/, "")}/${BUCKET}/${key}`;
}

/** The public address of a photo. Differs per Neon branch, which is why `images` holds keys. */
export function productImageUrl(key: string): string {
  return objectUrl(key);
}

export async function putObject(
  key: string,
  body: Uint8Array<ArrayBuffer>,
  contentType: string,
): Promise<void> {
  const env = storageEnv();
  const client = new AwsClient({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    service: "s3",
  });
  const response = await client.fetch(objectUrl(key), {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      // A key is never reused, so a photo can be cached for good.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
    body,
  });
  if (!response.ok) throw new StorageError(response.status);
}
