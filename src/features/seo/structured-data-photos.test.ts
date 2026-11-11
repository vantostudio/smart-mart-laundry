import { describe, expect, it } from "vite-plus/test";

import { site } from "@/config/site";
import { laundryItems, laundryPhoto } from "@/features/laundry/data";
import type { PublicProduct } from "@/features/products/public";

import { laundryServiceJsonLd, productJsonLd } from "./structured-data";

const dress: PublicProduct = {
  code: "SM-1003",
  name: "Linen dress",
  category: "ladies",
  condition: "mtumba",
  price: 800,
  sizes: ["M"],
  stock: 2,
  photos: [],
  thumbnail: null,
  note: null,
};

describe("productJsonLd photos", () => {
  it("makes same-site photo paths full URLs on the site, in order", () => {
    const photos = [
      "/photos/products/0b5e6f3a-8d2c-4f1e-9a7b-3c4d5e6f7a8b.webp",
      "/photos/products/9f8e7d6c-5b4a-4321-8fed-cba987654321.jpg",
    ];
    expect(productJsonLd({ ...dress, photos }).image).toEqual([
      `${site.url}/photos/products/0b5e6f3a-8d2c-4f1e-9a7b-3c4d5e6f7a8b.webp`,
      `${site.url}/photos/products/9f8e7d6c-5b4a-4321-8fed-cba987654321.jpg`,
    ]);
  });

  it("leaves https photo URLs as they are", () => {
    const photos = ["https://photos.test/products/a.jpg", "https://photos.test/products/b.jpg"];
    expect(productJsonLd({ ...dress, photos }).image).toEqual(photos);
  });
});

describe("laundryServiceJsonLd photos", () => {
  it("makes an uploaded photo's path a full URL and leaves Unsplash photos as they are", () => {
    const path = "/photos/products/0b5e6f3a-8d2c-4f1e-9a7b-3c4d5e6f7a8b-thumb";
    const [first, ...rest] = laundryItems;
    const items = [{ ...first!, image: path }, ...rest];
    const offers = laundryServiceJsonLd(items).hasOfferCatalog.itemListElement.flatMap(
      (c) => c.itemListElement,
    );
    const byName = new Map(offers.map((o) => [o.itemOffered.name, o.itemOffered.image]));

    expect(offers).toHaveLength(items.length);
    expect(byName.get(first!.name)).toBe(`${site.url}${path}`);
    for (const item of rest) {
      expect(byName.get(item.name)).toBe(laundryPhoto(item.image, 800));
      expect(byName.get(item.name)).toMatch(/^https:\/\/images\.unsplash\.com\//);
    }
  });
});
