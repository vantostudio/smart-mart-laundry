import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { PublicProduct } from "@/features/products/public";

vi.mock("server-only", () => ({}));
vi.mock("@/features/products/lib/cached-products", () => ({ getCachedPublicProduct: vi.fn() }));
// The page and its client component pull in the whole shop; only the 404 and metadata matter here.
vi.mock("@/features/shop/components/product-page", () => ({ ProductPage: () => null }));

const { getCachedPublicProduct } = await import("@/features/products/lib/cached-products");
const { default: Page, generateMetadata } = await import("./page");

const dress: PublicProduct = {
  code: "SM-1001",
  name: "Linen dress",
  category: "ladies",
  condition: "mtumba",
  price: 800,
  sizes: [],
  stock: 1,
  photos: ["https://photos.test/products/a.jpg"],
  thumbnail: "https://photos.test/products/a-thumb",
  note: null,
};

const props = (code: string) => ({ params: Promise.resolve({ code }) }) as never;

beforeEach(() => {
  vi.mocked(getCachedPublicProduct).mockReset();
});

describe("/shop/[code]", () => {
  it("renders the product", async () => {
    vi.mocked(getCachedPublicProduct).mockResolvedValue(dress);
    const page = await Page(props("sm-1001"));
    expect(page).toBeTruthy();
    expect(getCachedPublicProduct).toHaveBeenCalledWith("SM-1001");
  });

  it("is a real 404 for sold out or deleted products", async () => {
    vi.mocked(getCachedPublicProduct).mockResolvedValue(null);
    await expect(Page(props("SM-1002"))).rejects.toMatchObject({
      digest: "NEXT_HTTP_ERROR_FALLBACK;404",
    });
  });

  it("is a 404 for a code that can't exist, without reading the database", async () => {
    for (const code of ["placeholder", "SM-1' or 1=1", "../admin"]) {
      await expect(Page(props(code))).rejects.toMatchObject({
        digest: "NEXT_HTTP_ERROR_FALLBACK;404",
      });
    }
    expect(getCachedPublicProduct).not.toHaveBeenCalled();
  });

  it("lets a database failure through as an error, never as a 404", async () => {
    vi.mocked(getCachedPublicProduct).mockRejectedValue(new Error("down"));
    await expect(Page(props("SM-1001"))).rejects.toThrow("down");
  });

  it("gives the title, description, canonical URL and first photo as the social image", async () => {
    vi.mocked(getCachedPublicProduct).mockResolvedValue(dress);
    const meta = await generateMetadata(props("SM-1001"));
    expect(meta.title).toBe("Linen dress");
    expect(meta.description).toContain("KSh 800");
    expect(meta.alternates?.canonical).toBe("/shop/SM-1001");
    expect(meta.openGraph?.images).toEqual([
      { url: "https://photos.test/products/a.jpg", width: 1200, height: 630 },
    ]);
  });
});
