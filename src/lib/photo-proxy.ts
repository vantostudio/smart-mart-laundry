/* Relative imports, no server code and no env: Wrangler bundles it into the Worker entry. */

import { isPhotoKey } from "../features/products/lib/image-keys";
import { bucketObjectUrl } from "./photo-bucket";

/*
 * `GET` and `HEAD /photos/<key>`: a product photo from the public bucket, read unsigned and
 * forwarding nothing from the client. Only keys our upload makes are served, only as one of three
 * image types, and Neon's own headers and bodies never pass through.
 */

export type PhotoLog = (
  level: "warn" | "error",
  msg: string,
  fields: { requestId: string; [key: string]: unknown },
) => void;

export type PhotoDeps = {
  endpoint?: string;
  cache?: Cache;
  waitUntil?: (p: Promise<unknown>) => void;
  fetch?: typeof fetch;
  log: PhotoLog;
};

const PREFIX = "/photos/";
const TIMEOUT_MS = 10_000;
const MAX_REQUEST_ID_LENGTH = 128;
const IMAGE_TYPES = new Set(["image/jpeg", "image/webp", "image/png"]);
const IMMUTABLE = "public, max-age=31536000, immutable";
const MISSING = "public, max-age=60";

function headerValue(headers: Headers, name: string): string | null {
  const value = headers.get(name)?.trim().slice(0, MAX_REQUEST_ID_LENGTH);
  return value ? value : null;
}

/* The rule in `request-id.ts`, which can't be imported here. */
function requestIdFrom(headers: Headers): string {
  return (
    headerValue(headers, "cf-ray") ?? headerValue(headers, "x-request-id") ?? crypto.randomUUID()
  );
}

function errorResponse(
  status: number,
  code: "NOT_FOUND" | "INTERNAL",
  requestId: string,
  headers: Record<string, string>,
): Response {
  const message = code === "NOT_FOUND" ? "Photo not found" : "Internal error";
  return new Response(JSON.stringify({ error: { code, message, requestId } }), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function failureStatus(error: unknown): "timeout" | "network" {
  const name = typeof error === "object" && error !== null && "name" in error ? error.name : "";
  return name === "TimeoutError" || name === "AbortError" ? "timeout" : "network";
}

function mediaType(response: Response): string | undefined {
  return response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
}

function photoHeaders(upstream: Response, type: string): Headers {
  const headers = new Headers({ "Content-Type": type });
  for (const name of ["Content-Length", "ETag"]) {
    const value = upstream.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set("Cache-Control", IMMUTABLE);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Photo-Cache", "MISS");
  return headers;
}

/** The answer a GET would get. HEAD drops the body afterwards. */
async function answer(request: Request, deps: PhotoDeps): Promise<Response> {
  const requestId = requestIdFrom(request.headers);
  const url = new URL(request.url);
  const key = url.pathname.startsWith(PREFIX) ? url.pathname.slice(PREFIX.length) : "";
  if (!isPhotoKey(key))
    return errorResponse(404, "NOT_FOUND", requestId, { "Cache-Control": MISSING });

  const { cache } = deps;
  const cacheKey = new Request(url.origin + PREFIX + key);
  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) {
      const headers = new Headers(hit.headers);
      headers.set("X-Photo-Cache", "HIT");
      return new Response(hit.body, { status: hit.status, headers });
    }
  }

  if (!deps.endpoint) {
    deps.log("error", "photo_unavailable", { requestId });
    return errorResponse(503, "INTERNAL", requestId, { "Cache-Control": "no-store" });
  }

  const fetchPhoto = deps.fetch ?? fetch;
  let upstream: Response;
  try {
    upstream = await fetchPhoto(bucketObjectUrl(deps.endpoint, key), {
      method: "GET",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    deps.log("warn", "photo_fetch_failed", { requestId, key, status: failureStatus(error) });
    return errorResponse(502, "INTERNAL", requestId, { "Cache-Control": "no-store" });
  }

  const type = mediaType(upstream);
  let response: Response;
  if (upstream.status === 200 && type !== undefined && IMAGE_TYPES.has(type)) {
    response = new Response(upstream.body, { status: 200, headers: photoHeaders(upstream, type) });
  } else if (upstream.status === 403 || upstream.status === 404) {
    // A public bucket answers 403 for a key that isn't there.
    await upstream.body?.cancel();
    response = errorResponse(404, "NOT_FOUND", requestId, {
      "Cache-Control": MISSING,
      "X-Photo-Cache": "MISS",
    });
  } else {
    await upstream.body?.cancel();
    const status = upstream.status === 200 ? "content_type" : upstream.status;
    deps.log("warn", "photo_fetch_failed", { requestId, key, status });
    return errorResponse(502, "INTERNAL", requestId, { "Cache-Control": "no-store" });
  }

  if (cache) {
    const stored = cache.put(cacheKey, response.clone());
    if (deps.waitUntil) deps.waitUntil(stored);
    else await stored;
  }
  return response;
}

export async function servePhoto(request: Request, deps: PhotoDeps): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  }
  const response = await answer(request, deps);
  if (request.method === "GET") return response;
  await response.body?.cancel();
  return new Response(null, { status: response.status, headers: response.headers });
}
