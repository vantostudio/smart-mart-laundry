import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { shopMessages } from "@/features/shop/messages";

import { fetchProducts } from "./api-client";

afterEach(() => vi.unstubAllGlobals());

describe("a busy answer", () => {
  it("is a plain, retryable problem, not 'unavailable'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 429 })));
    const result = await fetchProducts("/api/products", new AbortController().signal);
    expect(result).toEqual({ ok: false, problem: "busy" });
    expect(shopMessages.list.busy.body).toBe(
      "That was a lot of requests. Please wait a moment and try again.",
    );
    expect(shopMessages.more.busy).toBe(shopMessages.list.busy.body);
    expect(shopMessages.item.busy.body).toBe(shopMessages.list.busy.body);
  });
});
