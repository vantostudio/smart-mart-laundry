import type { OpeningHours } from "@/lib/opening-hours";

/**
 * Structured opening hours, in the shop's time zone, on the hour (pickup booking reads whole
 * hours). Keep in sync with `site.hours`.
 */
const openingHours: OpeningHours = [
  { days: [1, 2, 3, 4, 5, 6], open: "07:00", close: "20:00" },
  { days: [0], open: "09:00", close: "16:00" },
];

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
  openingHours,
  hours: [
    { days: "Monday – Saturday", time: "7:00 AM – 8:00 PM" },
    { days: "Sunday", time: "9:00 AM – 4:00 PM" },
  ],
  hoursNote: "Pickups can be booked online at any time.",
  phoneDisplay: "+254 113 154 708",
  whatsapp: "254113154708",
  email: "ngaruiavictor@gmail.com",
};

/** `tel:` link for the shop phone (same number as WhatsApp). */
export const phoneHref = `tel:+${site.whatsapp}`;

/** "Chuka University, Ndagani and Chuka town". */
export const areasText = new Intl.ListFormat("en-GB", { type: "conjunction" }).format(site.areas);
