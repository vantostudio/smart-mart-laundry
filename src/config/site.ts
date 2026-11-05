import { defaultShopSettings, openingHoursOf } from "./shop-settings";

export const site = {
  name: "Street Mart Kenya",
  description:
    "Free laundry pickup, ironing and delivery for Chuka University, Ndagani and Chuka town. Plus mtumba and brand new clothes and shoes from our shop at Chuka General.",
  url: "https://streetmart.africa",
  location: {
    point: "Chuka General, next to the main stage",
    town: "Chuka",
    county: "Tharaka-Nithi",
    postalCode: "60400",
    country: "Kenya",
    countryCode: "KE",
  },
  /** Where we pick up and deliver; used in page copy and structured data for local search. */
  areas: ["Chuka University", "Ndagani", "Chuka town"],
  /** Google Maps search for the shop, for "Directions" links. */
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Chuka+General+Chuka+Kenya",
  timeZone: "Africa/Nairobi",
  /**
   * The defaults: staff can change these in the admin. Pages read the live values with
   * `useShopSettings`; only search data (JSON-LD) stays on these, because it's built once.
   */
  openingHours: openingHoursOf(defaultShopSettings),
  whatsapp: defaultShopSettings.phone,
  hoursNote: "Pickups can be booked online at any time.",
};

/** "Chuka University, Ndagani and Chuka town". */
export const areasText = new Intl.ListFormat("en-GB", { type: "conjunction" }).format(site.areas);
