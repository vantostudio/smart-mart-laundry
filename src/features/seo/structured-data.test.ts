import { describe, expect, it } from "vite-plus/test";

import { defaultShopSettings, openingHoursOf } from "@/config/shop-settings";
import { site } from "@/config/site";
import { laundryItems } from "@/features/laundry/data";
import type { PublicProduct } from "@/features/products/public";

import {
  businessJsonLd,
  laundryServiceJsonLd,
  openingHoursSpecification,
  productJsonLd,
} from "./structured-data";

describe("businessJsonLd", () => {
  const [business, website] = businessJsonLd(defaultShopSettings, laundryItems)["@graph"];

  it("describes a laundry and clothing store in Chuka", () => {
    expect(business?.["@type"]).toEqual(["DryCleaningOrLaundry", "ClothingStore"]);
    expect(business).toMatchObject({
      name: site.name,
      url: site.url,
      telephone: "+254113154708",
      address: {
        addressLocality: "Chuka",
        addressRegion: "Tharaka-Nithi County",
        addressCountry: "KE",
      },
    });
    expect(website).toMatchObject({ "@type": "WebSite", publisher: { "@id": business?.["@id"] } });
  });

  it("names every area we serve, with the university as a university", () => {
    const areas = (business as { areaServed: { "@type": string; name: string }[] }).areaServed;
    expect(areas.map((a) => a.name)).toEqual(["Chuka University", "Ndagani", "Chuka"]);
    expect(areas[0]?.["@type"]).toBe("CollegeOrUniversity");
  });

  it("spans the cheapest to the dearest price on the site", () => {
    expect((business as { priceRange: string }).priceRange).toMatch(/^KSh \d+–[\d,]+$/);
  });
});

describe("businessJsonLd with saved settings", () => {
  const saved = { ...defaultShopSettings, phone: "254700000001", weekOpen: 8, weekClose: 18 };
  const [business] = businessJsonLd(saved, laundryItems)["@graph"];

  it("uses the live phone and opening hours, not the code defaults", () => {
    expect(business).toMatchObject({
      telephone: "+254700000001",
      openingHoursSpecification: [{ opens: "08:00", closes: "18:00" }, { opens: "09:00" }],
    });
  });
});

describe("openingHoursSpecification", () => {
  it("turns the opening hours into schema.org days and times", () => {
    expect(openingHoursSpecification(openingHoursOf(defaultShopSettings))).toContainEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["https://schema.org/Sunday"],
      opens: "09:00",
      closes: "16:00",
    });
  });
});

describe("saved laundry prices in search data", () => {
  const prices: Record<string, number> = { "basket-small": 175, "mat-door": 60 };
  const items = laundryItems.map((i) => ({ ...i, price: prices[i.id] ?? i.price }));

  it("lists the saved price and range", () => {
    const [business] = businessJsonLd(defaultShopSettings, items)["@graph"];
    expect(business).toMatchObject({ priceRange: "KSh 60–400" });
    expect(JSON.stringify(laundryServiceJsonLd(items))).toContain('"price":175');
  });

  it("shows an uploaded photo's own address", () => {
    const photo = "https://photos.test/products/a-thumb";
    const [first, ...rest] = laundryItems;
    const text = JSON.stringify(laundryServiceJsonLd([{ ...first!, image: photo }, ...rest]));
    expect(text).toContain(photo);
  });
});

describe("laundryServiceJsonLd", () => {
  it("lists every laundry item with its price in shillings", () => {
    const catalogue = laundryServiceJsonLd(laundryItems).hasOfferCatalog.itemListElement;
    const offers = catalogue.flatMap((c) => c.itemListElement);
    expect(offers).toHaveLength(laundryItems.length);
    expect(offers[0]).toMatchObject({ price: 150, priceCurrency: "KES" });
  });
});

describe("productJsonLd", () => {
  const dress: PublicProduct = {
    code: "SM-1003",
    name: "Linen dress",
    category: "ladies",
    condition: "mtumba",
    price: 800,
    sizes: ["M"],
    stock: 2,
    photos: ["https://photos.test/products/a.jpg", "https://photos.test/products/b.jpg"],
    thumbnail: "https://photos.test/products/a-thumb",
    note: "Barely worn.",
  };

  it("describes the piece with its price, availability and photos", () => {
    expect(productJsonLd(dress)).toMatchObject({
      "@type": "Product",
      name: "Linen dress",
      sku: "SM-1003",
      url: `${site.url}/shop/SM-1003`,
      image: dress.photos,
      offers: {
        "@type": "Offer",
        price: 800,
        priceCurrency: "KES",
        availability: "https://schema.org/InStock",
        url: `${site.url}/shop/SM-1003`,
      },
    });
  });

  it("maps mtumba to used and new to new", () => {
    expect(productJsonLd(dress).offers.itemCondition).toBe("https://schema.org/UsedCondition");
    expect(productJsonLd({ ...dress, condition: "new" }).offers.itemCondition).toBe(
      "https://schema.org/NewCondition",
    );
  });

  it("says out of stock at zero, and leaves out image when there are no photos", () => {
    const gone = productJsonLd({ ...dress, stock: 0, photos: [] });
    expect(gone.offers.availability).toBe("https://schema.org/OutOfStock");
    expect(gone).not.toHaveProperty("image");
  });

  it("never carries an id, a date or a storage key", () => {
    const json = JSON.stringify(productJsonLd({ ...dress, photos: [] }));
    expect(json).not.toMatch(/createdAt|"id"|images/);
  });
});
