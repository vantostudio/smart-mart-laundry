import { unsplash } from "@/lib/images";

export type PriceGroup = {
  id: string;
  title: string;
  note: string;
  items: { label: string; price: number }[];
};

export type LaundryItem = {
  id: string;
  name: string;
  desc: string;
  price: number;
  image: string;
  tag?: string;
};

export const priceGroups: PriceGroup[] = [
  {
    id: "baskets",
    title: "Clothes by basket",
    note: "Washed, dried and ironed",
    items: [
      { label: "Small basket", price: 150 },
      { label: "Medium basket", price: 250 },
      { label: "Large basket", price: 350 },
      { label: "Extra large basket", price: 400 },
    ],
  },
  {
    id: "duvets",
    title: "Duvets",
    note: "Deep cleaned and dried",
    items: [
      { label: "6 × 6 duvet", price: 350 },
      { label: "4 × 6 duvet", price: 250 },
      { label: "3.2 × 6 duvet", price: 200 },
      { label: "Baby cot duvet", price: 150 },
    ],
  },
  {
    id: "mats",
    title: "Mats",
    note: "Scrubbed and dried",
    items: [
      { label: "Door mat", price: 50 },
      { label: "Fluffy mat", price: 200 },
      { label: "Floor mat", price: 350 },
    ],
  },
  {
    id: "shoes",
    title: "Shoes",
    note: "Per pair, hand cleaned",
    items: [
      { label: "Plain white shoes", price: 150 },
      { label: "Coloured shoes", price: 100 },
    ],
  },
];

export const laundryItems: LaundryItem[] = [
  {
    id: "basket-small",
    name: "Small basket",
    desc: "Fits a week of clothes for one person.",
    price: 150,
    tag: "Popular",
    image: unsplash("photo-1758279744970-b32360a5e907"),
  },
  {
    id: "basket-medium",
    name: "Medium basket",
    desc: "Ideal for a couple's weekly load.",
    price: 250,
    image: unsplash("photo-1789003712201-b60e9c229674"),
  },
  {
    id: "basket-large",
    name: "Large basket",
    desc: "Plenty of room for a family load.",
    price: 350,
    image: unsplash("photo-1760722974657-f64bce2f9cc5"),
  },
  {
    id: "basket-xl",
    name: "Extra large basket",
    desc: "Our biggest basket for heavy household loads.",
    price: 400,
    image: unsplash("photo-1642720574580-45b9bedb77e6"),
  },
  {
    id: "duvet-6x6",
    name: "6 × 6 duvet",
    desc: "Deep cleaned and dried, returned fresh and fluffy.",
    price: 350,
    image: unsplash("photo-1638878468165-a974415fed4f"),
  },
  {
    id: "duvet-4x6",
    name: "4 × 6 duvet",
    desc: "Ready to go straight back on the bed.",
    price: 250,
    image: unsplash("photo-1545173168-9f1947eebb7f"),
  },
  {
    id: "duvet-3-2x6",
    name: "3.2 × 6 duvet",
    desc: "Deep cleaned and dried, quick turnaround.",
    price: 200,
    image: unsplash("photo-1545173168-9f1947eebb7f"),
  },
  {
    id: "duvet-cot",
    name: "Baby cot duvet",
    desc: "Gentle wash for the littlest bedding.",
    price: 150,
    image: unsplash("photo-1522771930-78848d9293e8"),
  },
  {
    id: "mat-door",
    name: "Door mat",
    desc: "Mud and dust lifted out, scrubbed and dried.",
    price: 50,
    image: unsplash("photo-1674552641751-fb7ca800deae"),
  },
  {
    id: "mat-fluffy",
    name: "Fluffy mat",
    desc: "Pile brushed back up after drying.",
    price: 200,
    image: unsplash("photo-1675781471069-c2b59f3a357a"),
  },
  {
    id: "mat-floor",
    name: "Floor mat",
    desc: "Deep cleaned on both sides.",
    price: 350,
    image: unsplash("photo-1669101602108-fa5ba89507ee"),
  },
  {
    id: "shoes-pair",
    name: "Shoes, per pair",
    desc: "Hand cleaned — plain white or coloured.",
    price: 150,
    image: unsplash("photo-1579528542333-4148f1769c35"),
  },
];

export const turnaroundOptions = [
  { label: "Same day", note: "Back by evening, same day" },
  { label: "Next day", note: "Back by the next evening" },
  { label: "Standard (2 days)", note: "Back within two days" },
] as const;
export const dayOptions = [
  "Today",
  "Tomorrow",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export const timeOptions = [
  "7:00 AM",
  "9:00 AM",
  "11:00 AM",
  "1:00 PM",
  "3:00 PM",
  "5:00 PM",
  "7:00 PM",
] as const;

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
