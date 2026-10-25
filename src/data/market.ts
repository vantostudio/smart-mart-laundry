const u = (path: string) =>
  `https://images.unsplash.com/${path}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900`;

export type MarketCategory = {
  id: string;
  name: string;
  caption: string;
  image: string;
};

export const egikombaCategories: MarketCategory[] = [
  {
    id: "ladies",
    name: "Ladies wear",
    caption: "Dresses, tops and outfits, mtumba and new",
    image: u("photo-1720343354398-89c6aa6d12a4"),
  },
  {
    id: "men",
    name: "Men wear",
    caption: "Shirts, jeans and everyday wear",
    image: u("photo-1626913477803-b3c2dae4496e"),
  },
  {
    id: "kids",
    name: "Kids wear",
    caption: "Children's clothing, all sizes",
    image: u("photo-1791774023109-54667cb235e7"),
  },
  {
    id: "campus",
    name: "Campus trendy wear",
    caption: "Streetwear for students, priced for campus",
    image: u("photo-1563132337-f159f484226c"),
  },
  {
    id: "suits",
    name: "Suit wear",
    caption: "Formal suits and occasion wear",
    image: u("photo-1586232902955-df204f34b36e"),
  },
];

export type ShopHighlight = {
  id: string;
  name: string;
  blurb: string;
  image: string;
};

export const shopHighlights: ShopHighlight[] = [
  {
    id: "everyday",
    name: "Everyday wear",
    blurb: "Shirts, tees, dresses and denim for the week.",
    image: u("photo-1626913477803-b3c2dae4496e"),
  },
  {
    id: "trendy",
    name: "Campus trends",
    blurb: "Fresh streetwear picked with students in mind.",
    image: u("photo-1563132337-f159f484226c"),
  },
  {
    id: "dresses",
    name: "Dresses & occasion",
    blurb: "Stand-out pieces for church, weddings and events.",
    image: u("photo-1590955256762-e60f6e08122a"),
  },
  {
    id: "formal",
    name: "Suits & formal",
    blurb: "Sharp suits and shoes for work and big days.",
    image: u("photo-1586232902955-df204f34b36e"),
  },
  {
    id: "shoes",
    name: "Shoes",
    blurb: "Sneakers, boots and sandals, tried before you buy.",
    image: u("photo-1560343090-f0409e92791a"),
  },
  {
    id: "kids",
    name: "Kids & family",
    blurb: "Clothes and shoes for the little ones too.",
    image: u("photo-1791774023109-54667cb235e7"),
  },
];

export type SellPlan = {
  id: string;
  name: string;
  for: string;
  price: number;
  featured?: boolean;
  features: string[];
};

export const sellPlans: SellPlan[] = [
  {
    id: "starter",
    name: "Starter",
    for: "For sellers testing the market",
    price: 1000,
    features: [
      "Up to 10 listings",
      "Street Mart delivers your orders",
      "Mtumba or new clothes",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    for: "For sellers with steady stock",
    price: 2500,
    featured: true,
    features: [
      "Up to 50 listings",
      "Featured badge on your products",
      "Monthly sales summary",
      "Street Mart delivers your orders",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    for: "For high-volume sellers",
    price: 5000,
    features: [
      "Unlimited listings",
      "Shown first in the market",
      "Homepage feature once a month",
      "Street Mart delivers your orders",
    ],
  },
];

export const ksh = (n: number) => `KSh ${n.toLocaleString("en-KE")}`;
