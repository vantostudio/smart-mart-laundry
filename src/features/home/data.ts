import { unsplash } from "@/lib/images";

export const HERO_IMAGE_ID = "photo-1780253200136-77514727a5da";

export const howSteps = [
  {
    title: "Book your pickup",
    body: "Order online or on WhatsApp — tell us what needs cleaning and when you need it back.",
  },
  {
    title: "We collect from your gate",
    body: "A boda rider picks up your basket, duvets, mats or shoes — free, anywhere in Chuka.",
  },
  {
    title: "Washed, dried, pressed",
    body: "Every load is washed with care and ironed free of charge before it leaves.",
  },
  {
    title: "Back before your deadline",
    body: "Delivered to your door and paid for on delivery — cash or M-Pesa when we arrive.",
  },
];

export const tourSteps = [
  {
    title: "We collect from your gate",
    body: "Free pickup anywhere in Chuka — baskets, duvets, mats or shoes.",
    image: unsplash("photo-1536505748812-02f39989d287"),
  },
  {
    title: "Washed and deep cleaned",
    body: "Every load washed, rinsed and dried with care.",
    image: unsplash("photo-1764117379509-6d1e3e966cc0"),
  },
  {
    title: "Pressed and folded, free",
    body: "Ironed, folded or hung — never a separate charge.",
    image: unsplash("photo-1710294772664-8c6b057ce7b7"),
  },
  {
    title: "Back before your deadline",
    body: "Same day, next day or standard — you set it.",
    image: unsplash("photo-1656068218535-85db26125e13"),
  },
];

export const testimonials = [
  {
    quote:
      "I booked at 8 in the morning and my clothes were back the next evening, ironed and folded. The rider even called before coming to the gate.",
    name: "Wanjiru M.",
    where: "Chuka Town",
  },
  {
    quote:
      "Two duvets and a floor mat for less than I expected, and the ironing was free. The ticket number made it easy to know when to expect them.",
    name: "Brian K.",
    where: "Chuka University area",
  },
  {
    quote:
      "I sell mtumba on E-Gikomba. My stall shows first on the Pro plan and Street Mart delivers every order for me. Worth every shilling.",
    name: "Faith N.",
    where: "E-Gikomba seller, Chuka",
  },
];
