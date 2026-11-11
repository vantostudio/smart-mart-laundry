import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { servePhoto, type PhotoDeps } from "./photo-proxy";

const key = "products/0f8b2c4e-9a1d-4e7f-b3c5-6d2a8e9f1b07.webp";
const photoUrl = `https://streetmart.test/photos/${key}`;
const bucketUrl = `https://storage.test/products/${key}`;

/** `match`/`put` over a `Map` keyed on the request URL, as the Cache API keys on it. */
function fakeCache() {
  const entries = new Map<string, Response>();
  const cache = {
    match: vi.fn<(request: Request) => Promise<Response | undefined>>(async (request) =>
      entries.get(request.url)?.clone(),
    ),
    put: vi.fn<(request: Request, response: Response) => Promise<void>>(
      async (request, response) => {
        entries.set(request.url, new Response(await response.arrayBuffer(), response));
      },
    ),
  };
  return { cache, entries, asCache: cache as unknown as Cache };
}

function neonPhoto() {
  return new Response(new Uint8Array([1, 2, 3]), {
    status: 200,
    headers: {
      "Content-Type": "image/webp",
      "Content-Length": "3",
      ETag: '"abc"',
      "x-amz-request-id": "neon-id",
      "Set-Cookie": "neon=1",
    },
  });
}

let fetchMock: ReturnType<typeof vi.fn<typeof fetch>>;
let logMock: ReturnType<typeof vi.fn<PhotoDeps["log"]>>;

beforeEach(() => {
  fetchMock = vi.fn<typeof fetch>();
  logMock = vi.fn<PhotoDeps["log"]>();
});

function deps(extra: Partial<PhotoDeps> = {}): PhotoDeps {
  return { endpoint: "https://storage.test/", fetch: fetchMock, log: logMock, ...extra };
}

async function errorBody(response: Response) {
  return ((await response.json()) as { error: Record<string, string> }).error;
}

describe("servePhoto", () => {
  it("fetches a good key from the bucket with no client headers and keeps only ours", async () => {
    fetchMock.mockResolvedValue(neonPhoto());
    const { cache, entries, asCache } = fakeCache();
    const pending: Promise<unknown>[] = [];
    const waitUntil = vi.fn<(p: Promise<unknown>) => void>((p) => void pending.push(p));
    const request = new Request(photoUrl, {
      headers: { Cookie: "session=1", Authorization: "Bearer x", Range: "bytes=0-1" },
    });

    const response = await servePhoto(request, deps({ cache: asCache, waitUntil }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(bucketUrl);
    expect(init?.method).toBe("GET");
    expect(init?.headers).toBeUndefined();
    expect(init?.signal).toBeDefined();
    expect(response.status).toBe(200);
    expect([...response.headers.keys()].sort()).toEqual([
      "cache-control",
      "content-length",
      "content-type",
      "etag",
      "x-content-type-options",
      "x-photo-cache",
    ]);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("content-length")).toBe("3");
    expect(response.headers.get("etag")).toBe('"abc"');
    expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(response.headers.get("x-photo-cache")).toBe("MISS");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
    expect(waitUntil).toHaveBeenCalledTimes(1);
    await Promise.all(pending);
    expect(cache.put).toHaveBeenCalledTimes(1);
    expect([...entries.keys()]).toEqual([photoUrl]);
  });

  it("answers a hit from the cache without fetching", async () => {
    const { asCache } = fakeCache();
    fetchMock.mockResolvedValue(neonPhoto());
    await servePhoto(new Request(photoUrl), deps({ cache: asCache }));
    fetchMock.mockClear();

    const response = await servePhoto(new Request(photoUrl), deps({ cache: asCache }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.status).toBe(200);
    expect(response.headers.get("x-photo-cache")).toBe("HIT");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("ignores the query string for the cache key", async () => {
    const { cache, entries, asCache } = fakeCache();
    fetchMock.mockResolvedValue(neonPhoto());
    await servePhoto(new Request(`${photoUrl}?x=1`), deps({ cache: asCache }));
    expect(cache.put.mock.calls[0]![0].url).toBe(photoUrl);
    expect([...entries.keys()]).toEqual([photoUrl]);
    fetchMock.mockClear();

    const response = await servePhoto(new Request(`${photoUrl}?y=2`), deps({ cache: asCache }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(response.headers.get("x-photo-cache")).toBe("HIT");
  });

  it("refuses a bad key without touching the cache or the bucket", async () => {
    const { cache, asCache } = fakeCache();
    for (const path of ["/photos/products/not-a-key.webp", "/photos/products/..%2Fsecret", "/x"]) {
      const response = await servePhoto(
        new Request(`https://streetmart.test${path}`),
        deps({ cache: asCache }),
      );
      expect(response.status).toBe(404);
      expect(response.headers.get("cache-control")).toBe("public, max-age=60");
      expect(await errorBody(response)).toMatchObject({
        code: "NOT_FOUND",
        message: "Photo not found",
      });
    }
    expect(fetchMock).not.toHaveBeenCalled();
    expect(cache.match).not.toHaveBeenCalled();
    expect(cache.put).not.toHaveBeenCalled();
  });

  it.each([403, 404])("treats a Neon %i as missing and caches it", async (status) => {
    const { entries, asCache } = fakeCache();
    fetchMock.mockResolvedValue(new Response("<Error>detail</Error>", { status }));

    const response = await servePhoto(new Request(photoUrl), deps({ cache: asCache }));

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("public, max-age=60");
    expect(response.headers.get("content-type")).toBe("application/json");
    const text = await response.text();
    expect(text).not.toContain("detail");
    expect(JSON.parse(text).error).toMatchObject({ code: "NOT_FOUND", message: "Photo not found" });
    expect(entries.get(photoUrl)?.status).toBe(404);
  });

  it.each([
    [
      "a Neon 500",
      () => Promise.resolve(new Response("<Error>detail</Error>", { status: 500 })),
      500,
    ],
    [
      "a timeout",
      () => Promise.reject(new DOMException("The operation timed out.", "TimeoutError")),
      "timeout",
    ],
    ["a network error", () => Promise.reject(new TypeError("fetch failed")), "network"],
    [
      "a page instead of a photo",
      () =>
        Promise.resolve(
          new Response("<html>", { status: 200, headers: { "Content-Type": "text/html" } }),
        ),
      "content_type",
    ],
  ] as const)("answers 502 for %s, uncached, and logs once", async (_name, upstream, status) => {
    const { cache, asCache } = fakeCache();
    fetchMock.mockImplementation(upstream);

    const response = await servePhoto(new Request(photoUrl), deps({ cache: asCache }));

    expect(response.status).toBe(502);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const text = await response.text();
    expect(text).not.toContain("detail");
    expect(JSON.parse(text).error).toMatchObject({ code: "INTERNAL", message: "Internal error" });
    expect(cache.put).not.toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledTimes(1);
    expect(logMock).toHaveBeenCalledWith("warn", "photo_fetch_failed", {
      requestId: expect.any(String),
      key,
      status,
    });
    expect(JSON.stringify(logMock.mock.calls)).not.toContain("storage.test");
  });

  it("answers 503 when no endpoint is configured", async () => {
    const response = await servePhoto(new Request(photoUrl), deps({ endpoint: undefined }));

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await errorBody(response)).toMatchObject({ code: "INTERNAL" });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(logMock).toHaveBeenCalledWith("error", "photo_unavailable", {
      requestId: expect.any(String),
    });
  });

  it("answers HEAD with the GET headers and no body, and caches the full photo", async () => {
    const { entries, asCache } = fakeCache();
    fetchMock.mockResolvedValue(neonPhoto());

    const response = await servePhoto(
      new Request(photoUrl, { method: "HEAD" }),
      deps({ cache: asCache }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(response.headers.get("content-length")).toBe("3");
    expect(response.headers.get("x-photo-cache")).toBe("MISS");
    expect(response.body).toBeNull();
    const stored = entries.get(photoUrl)!;
    expect(new Uint8Array(await stored.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
  });

  it("refuses other methods", async () => {
    const response = await servePhoto(new Request(photoUrl, { method: "POST" }), deps());

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
    expect(await response.text()).toBe("");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("takes the requestId from cf-ray, then x-request-id, cut to 128 characters", async () => {
    const idOf = async (headers: Record<string, string>) => {
      const request = new Request("https://streetmart.test/photos/bad", { headers });
      return (await errorBody(await servePhoto(request, deps()))).requestId;
    };

    expect(await idOf({ "cf-ray": " ray-1 ", "x-request-id": "req-1" })).toBe("ray-1");
    expect(await idOf({ "cf-ray": " ", "x-request-id": "req-1" })).toBe("req-1");
    expect(await idOf({ "x-request-id": "a".repeat(200) })).toBe("a".repeat(128));
    expect(await idOf({})).toMatch(/^[0-9a-f-]{36}$/);
  });
});
