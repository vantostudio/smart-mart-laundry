import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { siteNav } from "@/config/navigation";
import { site } from "@/config/site";

vi.mock("server-only", () => ({}));
vi.mock("@/features/products/lib/cached-products", () => ({ getCachedSitemapCodes: vi.fn() }));

const { getCachedSitemapCodes } = await import("@/features/products/lib/cached-products");
const { default: sitemap } = await import("./sitemap");

const urls = async () => (await sitemap()).map((e) => e.url);

beforeEach(() => {
  vi.mocked(getCachedSitemapCodes).mockResolvedValue([]);
});

describe("sitemap", () => {
  it("lists the fixed pages on the real site address when there are no products", async () => {
    expect(await urls()).toEqual([
      `${site.url}/`,
      ...siteNav.map((l) => new URL(l.href, site.url).toString()),
    ]);
  });

  it("adds every in-stock product at /shop/<code>", async () => {
    vi.mocked(getCachedSitemapCodes).mockResolvedValue(["SM-1003", "SM-1001"]);
    const all = await urls();
    expect(all).toContain(`${site.url}/shop/SM-1003`);
    expect(all).toContain(`${site.url}/shop/SM-1001`);
    expect(all).toHaveLength(1 + siteNav.length + 2);
  });
});
