export type LaundryCategory = "baskets" | "duvets" | "mats" | "carpets" | "shoes";

export type LaundryItem = {
  id: string;
  category: LaundryCategory;
  name: string;
  desc: string;
  price: number;
  /** Unsplash photo id for the item's card. */
  image: string;
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
  /** Unsplash photo id for the category rail. */
  image: string;
}[] = [
  {
    id: "baskets",
    label: "Baskets",
    title: "Clothes by basket",
    note: "Washed, dried and ironed",
    image: "photo-1582735689369-4fe89db7114c",
  },
  {
    id: "duvets",
    label: "Duvets",
    title: "Duvets",
    note: "Deep cleaned and dried",
    image: "photo-1702501543049-4cb666eeda15",
  },
  {
    id: "mats",
    label: "Mats",
    title: "Mats",
    note: "Scrubbed and dried",
    image: "photo-1549295265-b0c1f7fb6147",
  },
  {
    id: "carpets",
    label: "Carpets",
    title: "Carpets",
    note: "Deep washed and dried, by size",
    image: "photo-1757618978085-850cad5b020a",
  },
  {
    id: "shoes",
    label: "Shoes",
    title: "Shoes",
    note: "Per pair, hand cleaned",
    image: "photo-1692620334820-355161f652a8",
  },
];

export const laundryItems: LaundryItem[] = [
  {
    id: "basket-small",
    category: "baskets",
    name: "Small basket",
    desc: "Fits a week of clothes for one person.",
    price: 150,
    image: "photo-1591130901959-9723d22a59ed",
    mark: "S",
    tag: "Popular",
  },
  {
    id: "basket-medium",
    category: "baskets",
    name: "Medium basket",
    desc: "Ideal for a couple's weekly load.",
    price: 250,
    image: "photo-1582735689369-4fe89db7114c",
    mark: "M",
  },
  {
    id: "basket-large",
    category: "baskets",
    name: "Large basket",
    desc: "Plenty of room for a family load.",
    price: 350,
    image: "photo-1645542554266-b275c100103c",
    mark: "L",
  },
  {
    id: "basket-xl",
    category: "baskets",
    name: "Extra large basket",
    desc: "Our biggest basket for heavy household loads.",
    price: 400,
    image: "photo-1639739767611-cc582846849f",
    mark: "XL",
  },
  {
    id: "duvet-6x6",
    category: "duvets",
    name: "6 × 6 duvet",
    desc: "Deep cleaned and dried, returned fresh and fluffy.",
    price: 350,
    image: "photo-1702501543049-4cb666eeda15",
    mark: "6×6",
  },
  {
    id: "duvet-4x6",
    category: "duvets",
    name: "4 × 6 duvet",
    desc: "Ready to go straight back on the bed.",
    price: 250,
    image: "photo-1640747669771-b82a6e40f534",
    mark: "4×6",
  },
  {
    id: "duvet-3-2x6",
    category: "duvets",
    name: "3.2 × 6 duvet",
    desc: "Deep cleaned and dried, quick turnaround.",
    price: 200,
    image: "photo-1733980403355-1f60487f99f9",
    mark: "3.2×6",
  },
  {
    id: "duvet-cot",
    category: "duvets",
    name: "Baby cot duvet",
    desc: "Gentle wash for the littlest bedding.",
    price: 150,
    image: "photo-1739874244845-64aeccd01432",
    mark: "Cot",
  },
  {
    id: "mat-door",
    category: "mats",
    name: "Door mat",
    desc: "Mud and dust lifted out, scrubbed and dried.",
    price: 50,
    image: "photo-1549295265-b0c1f7fb6147",
  },
  {
    id: "mat-fluffy",
    category: "mats",
    name: "Fluffy mat",
    desc: "Pile brushed back up after drying.",
    price: 200,
    image: "photo-1520762042279-ae3264026bd2",
  },
  {
    id: "mat-floor",
    category: "mats",
    name: "Floor mat",
    desc: "Deep cleaned on both sides.",
    price: 350,
    image: "photo-1672403391906-810131b660eb",
  },
  // Carpet prices are placeholders until the client confirms them.
  {
    id: "carpet-small",
    category: "carpets",
    name: "Small carpet",
    desc: "Up to 4 × 6 ft, deep washed and dried.",
    price: 400,
    image: "photo-1762758889413-64d717f81b0d",
    mark: "4×6",
  },
  {
    id: "carpet-medium",
    category: "carpets",
    name: "Medium carpet",
    desc: "About 5 × 8 ft, deep washed and dried.",
    price: 700,
    image: "photo-1714647211963-fa82bd5b3a7a",
    mark: "5×8",
  },
  {
    id: "carpet-large",
    category: "carpets",
    name: "Large carpet",
    desc: "About 7 × 10 ft, deep washed and dried.",
    price: 1000,
    image: "photo-1757618978085-850cad5b020a",
    mark: "7×10",
  },
  {
    id: "shoes-white",
    category: "shoes",
    name: "Plain white shoes",
    desc: "Hand cleaned, per pair.",
    price: 150,
    image: "photo-1641792669588-b9754e4257ac",
  },
  {
    id: "shoes-coloured",
    category: "shoes",
    name: "Coloured shoes",
    desc: "Hand cleaned, per pair.",
    price: 100,
    image: "photo-1692620334820-355161f652a8",
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
