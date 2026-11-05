import { openingHoursOf, type ShopSettings } from "@/config/shop-settings";
import { site } from "@/config/site";
import { HERO_IMAGE_ID } from "@/features/home/data";
import { categoryLabels } from "@/features/products/labels";
import type { PublicProduct } from "@/features/products/public";
import { shopMessages } from "@/features/shop/messages";
import { itemsIn, laundryCategories, laundryItems } from "@/features/laundry/data";
import { ksh } from "@/lib/format";
import { ogImage, unsplash } from "@/lib/images";
import type { OpeningHours } from "@/lib/opening-hours";

/*
 * schema.org data (JSON-LD) that tells search engines what Street Mart is, where it is, when it's
 * open and which areas it serves, so local searches ("laundry near Chuka University", "mtumba
 * Chuka") can match it. Built from the same config and data the pages show, so they never drift.
 * The phone and opening hours are the live shop settings, passed in. Check changes with https://search.google.com/test/rich-results.
 */

const BUSINESS_ID = `${site.url}/#business`;
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function openingHoursSpecification(hours: OpeningHours) {
  return hours.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: h.days.map((d) => `https://schema.org/${WEEKDAYS[d]}`),
    opens: h.open,
    closes: h.close,
  }));
}

/** The university as a university, the rest as places in Chuka. */
function areaServed() {
  const town = {
    "@type": "City",
    name: site.location.town,
    containedInPlace: { "@type": "AdministrativeArea", name: `${site.location.county} County` },
  };
  return site.areas.map((name) =>
    name.includes("University")
      ? { "@type": "CollegeOrUniversity", name }
      : name === "Chuka town"
        ? town
        : { "@type": "Place", name, containedInPlace: town },
  );
}

const allPrices = laundryItems.map((i) => i.price);

/** Every page: the business (laundry and clothing store in one) and the website. */
export function businessJsonLd(settings: ShopSettings) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["DryCleaningOrLaundry", "ClothingStore"],
        "@id": BUSINESS_ID,
        name: site.name,
        alternateName: "Street Mart",
        description: site.description,
        url: site.url,
        logo: `${site.url}/apple-icon`,
        image: ogImage(HERO_IMAGE_ID),
        telephone: `+${settings.phone}`,
        priceRange: `${ksh(Math.min(...allPrices))}–${ksh(Math.max(...allPrices)).replace("KSh ", "")}`,
        currenciesAccepted: "KES",
        paymentAccepted: "Cash, M-Pesa",
        address: {
          "@type": "PostalAddress",
          streetAddress: site.location.point,
          addressLocality: site.location.town,
          addressRegion: `${site.location.county} County`,
          postalCode: site.location.postalCode,
          addressCountry: site.location.countryCode,
        },
        hasMap: site.mapsUrl,
        openingHoursSpecification: openingHoursSpecification(openingHoursOf(settings)),
        areaServed: areaServed(),
        knowsAbout: ["Laundry", "Dry cleaning", "Ironing", "Duvet cleaning", "Mtumba", "Shoes"],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: "en-KE",
        publisher: { "@id": BUSINESS_ID },
      },
    ],
  };
}

/** /laundry: the pickup service with its price list. */
export function laundryServiceJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Laundry pickup, washing, ironing and delivery",
    serviceType: "Laundry service",
    url: `${site.url}/laundry`,
    provider: { "@id": BUSINESS_ID },
    areaServed: areaServed(),
    description:
      "Free pickup, washing, drying, free ironing and free delivery back to your door. Pay on delivery, cash or M-Pesa.",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Laundry prices",
      itemListElement: laundryCategories.map((c) => ({
        "@type": "OfferCatalog",
        name: c.label,
        itemListElement: itemsIn(c.id).map((i) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: i.name,
            description: i.desc,
            image: unsplash(i.image, 800),
          },
          price: i.price,
          priceCurrency: "KES",
        })),
      })),
    },
  };
}

/** What `itemCondition` says for each way we sell: mtumba is second hand. */
const conditionUrls = {
  new: "https://schema.org/NewCondition",
  mtumba: "https://schema.org/UsedCondition",
} as const;

/**
 * `/shop/[code]`: one piece with its price and whether it can be bought. Built only from the public
 * product, so it never carries an id, a date or a storage key.
 */
export function productJsonLd(p: PublicProduct) {
  const url = `${site.url}/shop/${p.code}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: p.name,
    sku: p.code,
    url,
    description: shopMessages.productPage.description(p),
    category: categoryLabels[p.category],
    ...(p.photos.length > 0 && { image: p.photos }),
    offers: {
      "@type": "Offer",
      url,
      price: p.price,
      priceCurrency: "KES",
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: conditionUrls[p.condition],
      seller: { "@id": BUSINESS_ID },
    },
  };
}
