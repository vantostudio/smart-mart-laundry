export type LaundryCategory = "baskets" | "duvets" | "mats" | "carpets" | "shoes";

export type LaundryItem = {
  id: string;
  category: LaundryCategory;
  name: string;
  desc: string;
  price: number;
  /** Size shown on the item's card ("S", "6×6", "5×8"). */
  mark?: string;
  tag?: string;
};

/** Tabs on the laundry page, in order, with the heading and note the price list shows. */
export const laundryCategories: {
  id: LaundryCategory;
  label: string;
  title: string;
  note: string;
}[] = [
  { id: "baskets", label: "Baskets", title: "Clothes by basket", note: "Washed, dried and ironed" },
  { id: "duvets", label: "Duvets", title: "Duvets", note: "Deep cleaned and dried" },
  { id: "mats", label: "Mats", title: "Mats", note: "Scrubbed and dried" },
  { id: "carpets", label: "Carpets", title: "Carpets", note: "Deep washed and dried, by size" },
  { id: "shoes", label: "Shoes", title: "Shoes", note: "Per pair, hand cleaned" },
];

export const laundryItems: LaundryItem[] = [
  {
    id: "basket-small",
    category: "baskets",
    name: "Small basket",
    desc: "Fits a week of clothes for one person.",
    price: 150,
    mark: "S",
    tag: "Popular",
  },
  {
    id: "basket-medium",
    category: "baskets",
    name: "Medium basket",
    desc: "Ideal for a couple's weekly load.",
    price: 250,
    mark: "M",
  },
  {
    id: "basket-large",
    category: "baskets",
    name: "Large basket",
    desc: "Plenty of room for a family load.",
    price: 350,
    mark: "L",
  },
  {
    id: "basket-xl",
    category: "baskets",
    name: "Extra large basket",
    desc: "Our biggest basket for heavy household loads.",
    price: 400,
    mark: "XL",
  },
  {
    id: "duvet-6x6",
    category: "duvets",
    name: "6 × 6 duvet",
    desc: "Deep cleaned and dried, returned fresh and fluffy.",
    price: 350,
    mark: "6×6",
  },
  {
    id: "duvet-4x6",
    category: "duvets",
    name: "4 × 6 duvet",
    desc: "Ready to go straight back on the bed.",
    price: 250,
    mark: "4×6",
  },
  {
    id: "duvet-3-2x6",
    category: "duvets",
    name: "3.2 × 6 duvet",
    desc: "Deep cleaned and dried, quick turnaround.",
    price: 200,
    mark: "3.2×6",
  },
  {
    id: "duvet-cot",
    category: "duvets",
    name: "Baby cot duvet",
    desc: "Gentle wash for the littlest bedding.",
    price: 150,
    mark: "Cot",
  },
  {
    id: "mat-door",
    category: "mats",
    name: "Door mat",
    desc: "Mud and dust lifted out, scrubbed and dried.",
    price: 50,
  },
  {
    id: "mat-fluffy",
    category: "mats",
    name: "Fluffy mat",
    desc: "Pile brushed back up after drying.",
    price: 200,
  },
  {
    id: "mat-floor",
    category: "mats",
    name: "Floor mat",
    desc: "Deep cleaned on both sides.",
    price: 350,
  },
  // Carpet prices are placeholders until the client confirms them.
  {
    id: "carpet-small",
    category: "carpets",
    name: "Small carpet",
    desc: "Up to 4 × 6 ft, deep washed and dried.",
    price: 400,
    mark: "4×6",
  },
  {
    id: "carpet-medium",
    category: "carpets",
    name: "Medium carpet",
    desc: "About 5 × 8 ft, deep washed and dried.",
    price: 700,
    mark: "5×8",
  },
  {
    id: "carpet-large",
    category: "carpets",
    name: "Large carpet",
    desc: "About 7 × 10 ft, deep washed and dried.",
    price: 1000,
    mark: "7×10",
  },
  {
    id: "shoes-white",
    category: "shoes",
    name: "Plain white shoes",
    desc: "Hand cleaned, per pair.",
    price: 150,
  },
  {
    id: "shoes-coloured",
    category: "shoes",
    name: "Coloured shoes",
    desc: "Hand cleaned, per pair.",
    price: 100,
  },
];

export const itemsIn = (category: LaundryCategory) =>
  laundryItems.filter((i) => i.category === category);

/** Cheapest basket, for "baskets from KSh …" lines. */
export const basketFrom = Math.min(...itemsIn("baskets").map((i) => i.price));

/** The price list: each category with its items' names and prices. */
export const priceGroups = laundryCategories.map((c) => ({
  ...c,
  items: itemsIn(c.id).map((i) => ({ label: i.name, price: i.price })),
}));

export const turnaroundOptions = [
  { label: "Same day", note: "Collected in the morning, back by evening" },
  { label: "Next day", note: "Back the next evening" },
  { label: "You choose", note: "Any return day within a week" },
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
