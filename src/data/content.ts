const u = (path: string) =>
  `https://images.unsplash.com/${path}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900`;

export const promises = [
  {
    title: "Free pickup & delivery",
    body: "A boda rider collects from your gate and returns everything to your door — no transport charge, anywhere in Chuka.",
  },
  {
    title: "Free ironing",
    body: "Everything comes back pressed and neatly folded or hung. Included in every basket price, never added at the end.",
  },
  {
    title: "You set the deadline",
    body: "Same day, next day or standard turnaround. We work backwards from your deadline, not from our convenience.",
  },
];

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
    image: u("photo-1536505748812-02f39989d287"),
  },
  {
    title: "Washed and deep cleaned",
    body: "Every load washed, rinsed and dried with care.",
    image: u("photo-1764117379509-6d1e3e966cc0"),
  },
  {
    title: "Pressed and folded, free",
    body: "Ironed, folded or hung — never a separate charge.",
    image: u("photo-1710294772664-8c6b057ce7b7"),
  },
  {
    title: "Back before your deadline",
    body: "Same day, next day or standard — you set it.",
    image: u("photo-1656068218535-85db26125e13"),
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

export type TicketStatus = {
  ticket: string;
  service: string;
  items: string;
  pickup: string;
  returnBy: string;
  total: string;
  status: string;
  statusNote: string;
  stage: number; // 0 booked, 1 collected, 2 washing, 3 out for delivery, 4 done
};

export const sampleTickets: Record<string, TicketStatus> = {
  "SM-48217": {
    ticket: "SM-48217",
    service: "Wash, dry & iron",
    items: "1 medium basket, 1 duvet 4×6",
    pickup: "Today, 9:30 AM",
    returnBy: "Tomorrow, 6:00 PM",
    total: "KSh 500",
    status: "Washing",
    statusNote: "Rider on schedule — delivery tomorrow evening.",
    stage: 2,
  },
  "SM-48310": {
    ticket: "SM-48310",
    service: "Wash & dry",
    items: "2 small baskets, 1 door mat",
    pickup: "Today, 11:00 AM",
    returnBy: "Today, 7:00 PM",
    total: "KSh 350",
    status: "Out for delivery",
    statusNote: "Rider left the shop — arriving before 7 PM.",
    stage: 3,
  },
  "SM-48402": {
    ticket: "SM-48402",
    service: "Shoe cleaning",
    items: "2 pairs, plain white",
    pickup: "Tomorrow, 9:00 AM",
    returnBy: "Tomorrow, 5:00 PM",
    total: "KSh 300",
    status: "Booked",
    statusNote: "Rider assigned — collection tomorrow morning.",
    stage: 0,
  },
};

export const trackStages = ["Booked", "Collected", "Washing", "Out for delivery", "Delivered"];
