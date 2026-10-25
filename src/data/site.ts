export const site = {
  name: "Street Mart Kenya",
  shortName: "Street Mart",
  tagline: "Laundry, clothing & E-Gikomba in Chuka",
  description:
    "Free laundry pickup, delivery and ironing across Chuka. Our own clothing shop and the E-Gikomba clothes and shoes marketplace — all at Chuka General.",
  url: "https://streetmart.africa",
  location: {
    point: "Chuka General, next to the main stage",
    area: "Tharaka Nithi County",
    country: "Kenya",
  },
  hours: [
    { days: "Monday – Saturday", time: "7:00 AM – 8:00 PM" },
    { days: "Sunday", time: "9:00 AM – 4:00 PM" },
  ],
  hoursNote: "Pickups can be booked online at any time.",
  phoneDisplay: "+254 113 154 708",
  whatsapp: "254113154708",
  email: "ngaruiavictor@gmail.com",
};

export function waLink(text: string): string {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_ORDER_DEFAULT =
  "Hi Street Mart, I'd like to book a laundry pickup or ask about your services.";
