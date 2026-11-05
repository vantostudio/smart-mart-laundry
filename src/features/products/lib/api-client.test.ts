import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { deleteProduct, errorText, saveProduct, uploadPhoto } from "./api-client";

const fetchMock = vi.fn<typeof fetch>();
const draft = { name: "Dress", category: "ladies", condition: "new", price: 1, stock: 1 } as const;
const error = { code: "VALIDATION", message: "Check this", field: "name", requestId: "r" } as const;

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

describe("saveProduct", () => {
  it("creates without an id", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "1" }, { status: 201 }));
    expect(await saveProduct(undefined, draft)).toEqual({ ok: true, data: { id: "1" } });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/products");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("POST");
  });

  it("changes with an id", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "1" }));
    await saveProduct("1", draft);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/products/1");
    expect(fetchMock.mock.calls[0]?.[1]?.method).toBe("PATCH");
  });

  it("returns the API's error", async () => {
    fetchMock.mockResolvedValue(Response.json({ error }, { status: 400 }));
    expect(await saveProduct(undefined, draft)).toEqual({ ok: false, error });
  });

  it("returns a failure when the network is down", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    const result = await saveProduct(undefined, draft);
    expect(result).toMatchObject({ ok: false, error: { code: "INTERNAL", requestId: "" } });
  });
});

describe("deleteProduct", () => {
  it("treats 204 as done", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    expect((await deleteProduct("1")).ok).toBe(true);
  });
});

describe("uploadPhoto", () => {
  it("posts the photo as a form", async () => {
    fetchMock.mockResolvedValue(Response.json({ key: "k", url: "u" }, { status: 201 }));
    await uploadPhoto(new Blob(["x"]));
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/admin/products/images");
    expect(fetchMock.mock.calls[0]?.[1]?.body).toBeInstanceOf(FormData);
  });
});

describe("errorText", () => {
  it("adds the code to quote for an unexpected failure", () => {
    const text = errorText({ code: "INTERNAL", message: "Internal error", requestId: "abc" });
    expect(text).toContain("abc");
  });

  it("uses the API's words otherwise, and for a network failure", () => {
    expect(errorText(error)).toBe("Check this");
    expect(errorText({ code: "INTERNAL", message: "Offline", requestId: "" })).toBe("Offline");
  });
});
