import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/features/admin/lib/auth", () => ({ requireAdminForAction: vi.fn() }));
vi.mock("@/lib/storage", () => ({
  putObject: vi.fn(),
  productImageUrl: (key: string) => `https://photos.test/${key}`,
}));

const { requireAdminForAction } = await import("@/features/admin/lib/auth");
const { putObject } = await import("@/lib/storage");
const { POST } = await import("./route");
const { thumbnailKey } = await import("@/features/products/lib/image-keys");

const webp = new TextEncoder().encode("RIFF....WEBPVP8 ");
const sameSite = { origin: "http://shop.test", host: "shop.test" };

/** Under jsdom a `Request` can't parse multipart, so the route gets the parsed field directly. */
function upload(
  file: unknown,
  headers: Record<string, string> = sameSite,
  thumbnail: unknown = photo(webp),
) {
  const request = new Request("http://shop.test/api/admin/products/images", {
    method: "POST",
    headers,
  });
  request.formData = async () => {
    if (file === undefined) throw new TypeError("Not a form");
    return { get: (name: string) => (name === "file" ? file : thumbnail) } as unknown as FormData;
  };
  return request;
}

const photo = (bytes: Uint8Array) => ({
  size: bytes.length,
  arrayBuffer: async () => bytes.slice().buffer,
});

beforeEach(() => {
  vi.mocked(putObject).mockReset();
  vi.mocked(putObject).mockResolvedValue();
  vi.mocked(requireAdminForAction).mockReset();
  vi.mocked(requireAdminForAction).mockResolvedValue({
    ok: true,
    admin: { adminId: "a", email: "a@example.com", name: null, role: "admin" },
  });
});

describe("POST /api/admin/products/images", () => {
  it("stores a photo under a key it chooses, and answers the key and URL", async () => {
    const res = await POST(upload(photo(webp)), undefined);
    expect(res.status).toBe(201);
    const { key, url } = await res.json();
    expect(key).toMatch(/^products\/[0-9a-f-]{36}\.webp$/);
    expect(url).toBe(`https://photos.test/${key}`);
    expect(putObject).toHaveBeenCalledWith(key, expect.any(Uint8Array), "image/webp");
    expect(putObject).toHaveBeenCalledWith(thumbnailKey(key), expect.any(Uint8Array), "image/webp");
  });

  it("refuses a missing, oversized, unreadable or PNG thumbnail, and stores nothing", async () => {
    const big = new Uint8Array(100 * 1024 + 1);
    big.set(webp);
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
    const page = new TextEncoder().encode("<script>alert(1)</script>");
    for (const bad of [null, "text", photo(big), photo(png), photo(page)]) {
      const res = await POST(upload(photo(webp), sameSite, bad), undefined);
      expect(res.status).toBe(400);
    }
    expect(putObject).not.toHaveBeenCalled();
  });

  it("goes by the bytes, not what the file claims to be", async () => {
    const page = new TextEncoder().encode("<script>alert(1)</script>");
    const res = await POST(upload(photo(page)), undefined);
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("VALIDATION");
    expect(putObject).not.toHaveBeenCalled();
  });

  it("refuses a photo over 2MB", async () => {
    const big = new Uint8Array(2 * 1024 * 1024 + 1);
    big.set(webp);
    expect((await POST(upload(photo(big)), undefined)).status).toBe(400);
    expect(putObject).not.toHaveBeenCalled();
  });

  it("refuses a request with no file", async () => {
    expect((await POST(upload(null), undefined)).status).toBe(400);
    expect((await POST(upload("text"), undefined)).status).toBe(400);
    expect((await POST(upload(undefined), undefined)).status).toBe(400);
  });

  it("refuses a signed-out caller and stores nothing", async () => {
    vi.mocked(requireAdminForAction).mockResolvedValue({
      ok: false,
      error: { code: "UNAUTHENTICATED", message: "Please sign in.", requestId: "req-1" },
    });
    expect((await POST(upload(photo(webp)), undefined)).status).toBe(401);
    expect(putObject).not.toHaveBeenCalled();
  });

  it("refuses another site", async () => {
    const headers = { origin: "http://evil.test", host: "shop.test" };
    expect((await POST(upload(photo(webp), headers), undefined)).status).toBe(403);
    expect(putObject).not.toHaveBeenCalled();
  });

  it("answers 500 when storage fails, with nothing from the failure", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(putObject).mockRejectedValue(
      Object.assign(new Error("secret-value"), { name: "StorageError", code: "503" }),
    );
    const res = await POST(upload(photo(webp)), undefined);
    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("secret-value");
    expect(String(error.mock.calls[0]?.[0])).toContain("StorageError");
    expect(String(error.mock.calls[0]?.[0])).not.toContain("secret-value");
    error.mockRestore();
  });
});
