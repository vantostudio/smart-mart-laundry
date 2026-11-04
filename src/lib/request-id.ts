import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

/* Long enough for any real id, short enough that a client can't flood the logs through a header. */
const MAX_LENGTH = 128;

function headerValue(headers: Headers, name: string): string | null {
  const value = headers.get(name)?.trim().slice(0, MAX_LENGTH);
  return value ? value : null;
}

/** Cloudflare's `cf-ray`, else `x-request-id`, else a fresh UUID. */
export function requestIdFrom(headers: Headers): string {
  return (
    headerValue(headers, "cf-ray") ?? headerValue(headers, "x-request-id") ?? crypto.randomUUID()
  );
}

/** The current request's id, the same for every caller in one request. */
export const getRequestId = cache(async () => requestIdFrom(await headers()));
