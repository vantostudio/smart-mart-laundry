import { describe, expect, it } from "vite-plus/test";

import { site } from "@/config/site";
import { laundryItems } from "@/features/laundry/data";

import { businessJsonLd, laundryServiceJsonLd, openingHoursSpecification } from "./structured-data";

describe("businessJsonLd", () => {
  const [business, website] = businessJsonLd()["@graph"];

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

describe("openingHoursSpecification", () => {
  it("turns the opening hours into schema.org days and times", () => {
    expect(openingHoursSpecification(site.openingHours)).toContainEqual({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["https://schema.org/Sunday"],
      opens: "09:00",
      closes: "16:00",
    });
  });
});

describe("laundryServiceJsonLd", () => {
  it("lists every laundry item with its price in shillings", () => {
    const catalogue = laundryServiceJsonLd().hasOfferCatalog.itemListElement;
    const offers = catalogue.flatMap((c) => c.itemListElement);
    expect(offers).toHaveLength(laundryItems.length);
    expect(offers[0]).toMatchObject({ price: 150, priceCurrency: "KES" });
  });
});
