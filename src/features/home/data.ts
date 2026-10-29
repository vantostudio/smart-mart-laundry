/** Unsplash photos (free Unsplash License) used on the home page. */
export const homeImages = {
  hero: {
    id: "photo-1761403460807-a89b7de9b4d3",
    alt: "Clothes tumbling inside stacked commercial washing machines",
  },
  folded: {
    id: "photo-1635274605638-d44babc08a4f",
    alt: "Stacks of freshly washed, folded shirts",
  },
  stack: { id: "photo-1640747669771-b82a6e40f534", alt: "A neat stack of folded, ironed clothes" },
  laundryRoom: {
    id: "photo-1696546761269-a8f9d2b80512",
    alt: "A laundry room with a basket of fresh linen in front of the washing machines",
  },
} as const;

/** Also the home page's Open Graph image. */
export const HERO_IMAGE_ID = homeImages.hero.id;

/** Order updates the hero cycles through, as a customer receives them. */
export const orderUpdates = [
  { status: "Rider at your gate", detail: "Collecting 1 medium basket" },
  { status: "Washing now", detail: "Sorted by colour, gentle cycle" },
  { status: "Ironed and folded", detail: "Packed and ready to go" },
  { status: "On its way back", detail: "Sent to you by SMS" },
] as const;

type HowStep = {
  title: string;
  body: string;
  /** Short reassurance under the copy. */
  perk: string;
};

export const howSteps: HowStep[] = [
  {
    title: "Book in two minutes",
    body: "Pick a day and a time, add your baskets, duvets, mats or shoes, and send the order on WhatsApp.",
    perk: "No account needed",
  },
  {
    title: "We pick it up",
    body: "A rider collects from your gate, hostel or office, anywhere in Chuka.",
    perk: "Free pickup",
  },
  {
    title: "Cleaned with care",
    body: "Washed, dried and pressed properly. Ironing is always on us.",
    perk: "Free ironing",
  },
  {
    title: "Back before your deadline",
    body: "We tell you it's on the way by WhatsApp, SMS or a call, whichever you chose. Pay when it arrives.",
    perk: "Cash or M-Pesa on delivery",
  },
];

/** Answers use only facts stated elsewhere on the site (prices, turnaround, payment). */
export const faqs = [
  {
    question: "Which basket do I need?",
    answer:
      "Small fits a week of clothes for one person. Medium suits a couple's weekly load, large a family load, and extra large heavy household loads. Baskets cost KSh 150 to 400, ironing included.",
  },
  {
    question: "Where do you pick up from?",
    answer:
      "Chuka University hostels, Ndagani estates and anywhere in Chuka town. The rider collects from your gate, hostel or office and brings everything back the same way.",
  },
  {
    question: "Can I buy clothes and shoes from you too?",
    answer:
      "Yes. Our shop at Chuka General has mtumba and brand new clothes and shoes. Order on the shop page and we deliver to your hostel or gate, or come try it on.",
  },
  {
    question: "When do I pay?",
    answer:
      "On delivery, when your clothes are back in your hands. Pay cash or M-Pesa; there is no deposit.",
  },
  {
    question: "Is pickup really free?",
    answer: "Yes. Pickup, delivery and ironing are free on every order, anywhere in Chuka.",
  },
  {
    question: "Do you clean duvets, mats and shoes?",
    answer:
      "Yes. Duvets are deep cleaned and dried, mats are scrubbed and dried, and shoes are hand cleaned per pair. Every price is on the laundry page.",
  },
  {
    question: "How fast can I get my clothes back?",
    answer:
      "You choose: same day (back by evening), next day (back by the next evening) or standard (within two days).",
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
      "I got two pairs of jeans and sneakers off the WhatsApp catalogue between lectures. The rider dropped them at my hostel the same evening.",
    name: "Faith N.",
    where: "Student, Chuka University",
  },
];
