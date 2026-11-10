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

const { deleteObject, productImageUrl, putObject } = await import("./storage");

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

  it("signs the upload and sends the bytes themselves, so the length is known", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const bytes = new Uint8Array([1]);
    await putObject(key, bytes, "image/webp");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("https://storage.test/products/products/a.webp");
    expect(init?.method).toBe("PUT");
    expect(init?.body).toBe(bytes);
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toContain("AWS4-HMAC-SHA256");
    expect(headers.get("content-type")).toBe("image/webp");
  });

  it("fails with only the status when Neon refuses", async () => {
    fetchMock.mockResolvedValue(new Response("<Error>detail</Error>", { status: 403 }));
    const err = await putObject(key, new Uint8Array([1]), "image/webp").catch((e: unknown) => e);
    expect(err).toMatchObject({ name: "StorageError", code: "403" });
    expect((err as Error).message).not.toContain("detail");
  });

  it("signs a delete", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await deleteObject(key);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toBe("https://storage.test/products/products/a.webp");
    expect(init?.method).toBe("DELETE");
    expect(new Headers(init?.headers).get("authorization")).toContain("AWS4-HMAC-SHA256");
  });

  it("treats a missing object as deleted, but fails with only the status otherwise", async () => {
    fetchMock.mockResolvedValue(new Response("<Error>detail</Error>", { status: 404 }));
    await expect(deleteObject(key)).resolves.toBeUndefined();
    fetchMock.mockResolvedValue(new Response("<Error>detail</Error>", { status: 500 }));
    const err = await deleteObject(key).catch((e: unknown) => e);
    expect(err).toMatchObject({ name: "StorageError", code: "500" });
    expect((err as Error).message).not.toContain("detail");
  });
});
