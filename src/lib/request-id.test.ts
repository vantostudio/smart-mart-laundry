import { describe, expect, it, vi } from "vite-plus/test";

import { getRequestId, requestIdFrom } from "./request-id";

vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "cf-ray": "8f1e2d3c4b5a-NBO", "x-request-id": "other" }),
}));

const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("requestIdFrom", () => {
  it("prefers cf-ray over x-request-id", () => {
    expect(requestIdFrom(new Headers({ "cf-ray": "ray-1", "x-request-id": "req-1" }))).toBe(
      "ray-1",
    );
  });

  it("uses x-request-id when there's no cf-ray", () => {
    expect(requestIdFrom(new Headers({ "x-request-id": " req-1 " }))).toBe("req-1");
  });

  it("makes a v4 UUID when neither is set or both are blank", () => {
    expect(requestIdFrom(new Headers())).toMatch(uuidV4);
    expect(requestIdFrom(new Headers({ "cf-ray": "   ", "x-request-id": "" }))).toMatch(uuidV4);
  });

  it("caps a long header at 128 characters", () => {
    expect(requestIdFrom(new Headers({ "cf-ray": "a".repeat(1000) }))).toHaveLength(128);
  });
});

describe("getRequestId", () => {
  it("reads the request's headers", async () => {
    await expect(getRequestId()).resolves.toBe("8f1e2d3c4b5a-NBO");
  });
});
