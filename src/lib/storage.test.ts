import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("server-only", () => ({}));
vi.mock("@/config/env", () => ({
  storageEnv: () => ({
    AWS_ACCESS_KEY_ID: "id",
    AWS_SECRET_ACCESS_KEY: "secret",
    AWS_ENDPOINT_URL_S3: "https://storage.test/",
    AWS_REGION: "eu-central-1",
  }),
}));

const { productImageUrl, putObject } = await import("./storage");

const key = "products/a.webp";
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("storage", () => {
  it("builds a path-style URL", () => {
    expect(productImageUrl(key)).toBe("https://storage.test/products/products/a.webp");
  });

  it("signs the upload and sets the type", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    await putObject(key, new Uint8Array([1]), "image/webp");
    const request = fetchMock.mock.calls[0]?.[0] as Request;
    expect(request.method).toBe("PUT");
    expect(request.headers.get("authorization")).toContain("AWS4-HMAC-SHA256");
    expect(request.headers.get("content-type")).toBe("image/webp");
  });

  it("fails with only the status when Neon refuses", async () => {
    fetchMock.mockResolvedValue(new Response("<Error>detail</Error>", { status: 403 }));
    const err = await putObject(key, new Uint8Array([1]), "image/webp").catch((e: unknown) => e);
    expect(err).toMatchObject({ name: "StorageError", code: "403" });
    expect((err as Error).message).not.toContain("detail");
  });
});
