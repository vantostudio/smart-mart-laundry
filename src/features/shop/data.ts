import { unsplash } from "@/lib/images";

/*
 * Shop — one place for clothes and shoes, mtumba and brand new. Stock comes from our own counter
 * at Chuka General and from local E-Gikomba sellers; customers don't need to know which.
 * Static sample stock for now; Lovable Cloud replaces `products` with API data later, so keep the
 * shapes close to what a product API would return.
 */

export type ShopCategoryId = "campus" | "ladies" | "men" | "shoes" | "formal" | "kids";

export type ShopCategory = {
  id: ShopCategoryId;
  name: string;
  caption: string;
  image: string;
};

export const shopCategories: ShopCategory[] = [
  {
    id: "campus",
    name: "Campus trends",
    caption: "Streetwear for students, priced for campus",
    image: unsplash("photo-1563132337-f159f484226c"),
  },
  {
    id: "ladies",
    name: "Ladies wear",
    caption: "Dresses, tops and outfits",
    image: unsplash("photo-1720343354398-89c6aa6d12a4"),
  },
  {
    id: "men",
    name: "Men wear",
    caption: "Shirts, tees, jeans and everyday wear",
    image: unsplash("photo-1626913477803-b3c2dae4496e"),
  },
  {
    id: "shoes",
    name: "Shoes",
    caption: "Sneakers, boots and sandals",
    image: unsplash("photo-1560343090-f0409e92791a"),
  },
  {
    id: "formal",
    name: "Suits & occasion",
    caption: "Suits, dresses and shoes for big days",
    image: unsplash("photo-1586232902955-df204f34b36e"),
  },
  {
    id: "kids",
    name: "Kids & family",
    caption: "Clothes and shoes in all sizes",
    image: unsplash("photo-1791774023109-54667cb235e7"),
  },
];

export type Condition = "mtumba" | "new";

export type Product = {
  id: string;
  /** Printed on the tag in store and sent in the WhatsApp order, so staff find the exact piece. */
  code: string;
  name: string;
  brand?: string;
  colour: string;
  category: ShopCategoryId;
  condition: Condition;
  price: number;
  /** In the order sizes are shown. Mtumba pieces come in one size. */
  sizes: string[];
  /** Pieces available; mtumba is one of a kind. */
  stock: number;
  /** Unsplash photo ids. */
  images: string[];
  /** Condition or fit note, e.g. "Grade A, no marks". */
  note?: string;
  /** When it arrived (ISO date), for "Newest". */
  added: string;
};

const clothes = ["XS", "S", "M", "L", "XL", "XXL"];

export const products: Product[] = [
  // Campus trends
  {
    id: "oversized-hoodie",
    code: "SM-1002",
    name: "Oversized hoodie",
    colour: "Charcoal",
    category: "campus",
    condition: "new",
    price: 1500,
    sizes: ["S", "M", "L", "XL"],
    stock: 8,
    images: ["photo-1668441515735-39c4331a1fcb"],
    note: "Heavy cotton fleece, dropped shoulders.",
    added: "2026-10-20",
  },
  {
    id: "denim-jacket-light",
    code: "SM-1001",
    name: "Light denim jacket",
    brand: "Levi's",
    colour: "Light blue",
    category: "campus",
    condition: "mtumba",
    price: 1200,
    sizes: ["M"],
    stock: 1,
    images: ["photo-1786908432694-b378d00ad6b2"],
    note: "Grade A, soft and broken in. No marks.",
    added: "2026-10-27",
  },
  {
    id: "graphic-tee-black",
    code: "SM-1003",
    name: "Black graphic tee",
    colour: "Black",
    category: "campus",
    condition: "new",
    price: 650,
    sizes: ["S", "M", "L", "XL"],
    stock: 12,
    images: ["photo-1543322748-33df6d3db806"],
    note: "Soft cotton, regular fit.",
    added: "2026-10-12",
  },
  {
    id: "black-hoodie",
    code: "SM-1004",
    name: "Black pullover hoodie",
    colour: "Black",
    category: "campus",
    condition: "mtumba",
    price: 900,
    sizes: ["L"],
    stock: 1,
    images: ["photo-1647797819874-f51a8a8fc5c0"],
    note: "Grade A, light wear on the cuffs.",
    added: "2026-10-18",
  },
  {
    id: "plain-white-tee",
    code: "SM-1005",
    name: "Plain white tee",
    colour: "White",
    category: "campus",
    condition: "new",
    price: 450,
    sizes: clothes.slice(0, 5),
    stock: 20,
    images: ["photo-1620799139507-2a76f79a2f4d", "photo-1620799139834-6b8f844fbe61"],
    note: "Crew neck, 100% cotton. Pairs with anything.",
    added: "2026-10-05",
  },

  // Ladies wear
  {
    id: "floral-midi-dress",
    code: "SM-1101",
    name: "Floral midi dress",
    colour: "Multicolour",
    category: "ladies",
    condition: "mtumba",
    price: 850,
    sizes: ["M"],
    stock: 1,
    images: ["photo-1583316174775-bd6dc0e9f298"],
    note: "Grade A, flowing fabric, no marks.",
    added: "2026-10-26",
  },
  {
    id: "white-floral-dress",
    code: "SM-1102",
    name: "White floral dress",
    colour: "White",
    category: "ladies",
    condition: "new",
    price: 1800,
    sizes: ["S", "M", "L"],
    stock: 5,
    images: ["photo-1750284384323-58dc7d112d71"],
    note: "Light and airy, lined skirt.",
    added: "2026-10-15",
  },
  {
    id: "monochrome-floral-dress",
    code: "SM-1103",
    name: "Black & white floral dress",
    colour: "Black and white",
    category: "ladies",
    condition: "mtumba",
    price: 700,
    sizes: ["S"],
    stock: 1,
    images: ["photo-1615339311558-8bf361333815"],
    note: "Grade A, fitted waist.",
    added: "2026-10-10",
  },
  {
    id: "blue-floral-dress",
    code: "SM-1104",
    name: "Blue floral dress",
    colour: "Blue",
    category: "ladies",
    condition: "mtumba",
    price: 750,
    sizes: ["L"],
    stock: 1,
    images: ["photo-1595118709609-575ef33e3d4e"],
    note: "Grade B, slight fading. Priced to go.",
    added: "2026-10-08",
  },
  {
    id: "cropped-denim-jacket",
    code: "SM-1105",
    name: "Classic denim jacket",
    colour: "Mid blue",
    category: "ladies",
    condition: "mtumba",
    price: 1000,
    sizes: ["S"],
    stock: 1,
    images: ["photo-1753877439268-6263fc86fdf2"],
    note: "Grade A, relaxed fit.",
    added: "2026-10-22",
  },

  // Men wear
  {
    id: "denim-jacket-men",
    code: "SM-1201",
    name: "Denim jacket",
    brand: "Wrangler",
    colour: "Indigo",
    category: "men",
    condition: "mtumba",
    price: 1300,
    sizes: ["L"],
    stock: 1,
    images: ["photo-1675442141177-b99b70652416"],
    note: "Grade A, all buttons intact.",
    added: "2026-10-19",
  },
  {
    id: "white-dress-shirt",
    code: "SM-1202",
    name: "White formal shirt",
    colour: "White",
    category: "men",
    condition: "new",
    price: 1200,
    sizes: ["S", "M", "L", "XL", "XXL"],
    stock: 10,
    images: ["photo-1579664531470-ac357f8f8e2b"],
    note: "Slim fit, easy iron cotton.",
    added: "2026-10-02",
  },
  {
    id: "straight-jeans",
    code: "SM-1203",
    name: "Straight-leg jeans",
    colour: "Dark blue",
    category: "men",
    condition: "new",
    price: 1600,
    sizes: ["30", "32", "34", "36"],
    stock: 9,
    images: ["photo-1645380672072-43f44d5ee29d", "photo-1721637286605-ae9be19d681f"],
    note: "Waist sizes in inches. Regular rise.",
    added: "2026-10-14",
  },
  {
    id: "levis-501",
    code: "SM-1204",
    name: "501 jeans",
    brand: "Levi's",
    colour: "Stone wash",
    category: "men",
    condition: "mtumba",
    price: 900,
    sizes: ["32"],
    stock: 1,
    images: ["photo-1515459961680-58264ee27219"],
    note: "Grade A, waist 32, length 32.",
    added: "2026-10-24",
  },
  {
    id: "trucker-jacket",
    code: "SM-1205",
    name: "Trucker denim jacket",
    colour: "Washed blue",
    category: "men",
    condition: "mtumba",
    price: 1100,
    sizes: ["XL"],
    stock: 1,
    images: ["photo-1775313005787-3cdfb03f84ad"],
    note: "Grade A, sherpa-free, light layer.",
    added: "2026-10-11",
  },

  // Shoes
  {
    id: "white-leather-sneakers",
    code: "SM-1301",
    name: "White leather sneakers",
    colour: "White",
    category: "shoes",
    condition: "new",
    price: 2800,
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    stock: 14,
    images: ["photo-1641792669588-b9754e4257ac"],
    note: "EU sizes. Clean, low-top, everyday pair.",
    added: "2026-10-16",
  },
  {
    id: "court-sneakers",
    code: "SM-1302",
    name: "Court sneakers",
    colour: "White and green",
    category: "shoes",
    condition: "mtumba",
    price: 1800,
    sizes: ["42"],
    stock: 1,
    images: ["photo-1727061180296-f5ba660b3e47"],
    note: "Grade A, cleaned and deodorised.",
    added: "2026-10-28",
  },
  {
    id: "white-runners",
    code: "SM-1303",
    name: "White runners",
    colour: "White",
    category: "shoes",
    condition: "new",
    price: 2200,
    sizes: ["39", "40", "41", "42", "43"],
    stock: 7,
    images: ["photo-1650012897087-72dc44c28cb3"],
    note: "Light and cushioned. EU sizes.",
    added: "2026-10-09",
  },
  {
    id: "black-leather-boots",
    code: "SM-1304",
    name: "Black leather boots",
    colour: "Black",
    category: "shoes",
    condition: "mtumba",
    price: 2000,
    sizes: ["43"],
    stock: 1,
    images: ["photo-1576967913877-5b6e6108eead"],
    note: "Grade A, re-polished, strong soles.",
    added: "2026-10-21",
  },
  {
    id: "brown-lace-up-boots",
    code: "SM-1305",
    name: "Brown lace-up boots",
    colour: "Brown",
    category: "shoes",
    condition: "mtumba",
    price: 2400,
    sizes: ["41"],
    stock: 1,
    images: ["photo-1449505278894-297fdb3edbc1", "photo-1479064555552-3ef4979f8908"],
    note: "Grade A, full grain leather.",
    added: "2026-10-13",
  },
  {
    id: "tan-suede-sandals",
    code: "SM-1306",
    name: "Tan suede sandals",
    colour: "Tan",
    category: "shoes",
    condition: "new",
    price: 1200,
    sizes: ["37", "38", "39", "40", "41"],
    stock: 6,
    images: ["photo-1732708862549-714f7478ca31"],
    note: "Two buckles, soft footbed.",
    added: "2026-10-17",
  },
  {
    id: "flip-flops",
    code: "SM-1307",
    name: "Everyday flip flops",
    colour: "Purple",
    category: "shoes",
    condition: "new",
    price: 350,
    sizes: ["37", "38", "39", "40", "41", "42", "43"],
    stock: 25,
    images: ["photo-1643081047954-473771becb0f"],
    added: "2026-10-01",
  },

  // Suits & occasion
  {
    id: "black-suit-jacket",
    code: "SM-1401",
    name: "Black suit jacket",
    colour: "Black",
    category: "formal",
    condition: "mtumba",
    price: 2500,
    sizes: ["L"],
    stock: 1,
    images: ["photo-1592343516109-362f7bd871aa"],
    note: "Grade A, single breasted, fully lined.",
    added: "2026-10-23",
  },
  {
    id: "two-piece-suit",
    code: "SM-1402",
    name: "Two-piece suit",
    colour: "Navy",
    category: "formal",
    condition: "new",
    price: 6500,
    sizes: ["M", "L", "XL"],
    stock: 4,
    images: ["photo-1586232902955-df204f34b36e"],
    note: "Jacket and trousers. Free fitting at the shop.",
    added: "2026-10-06",
  },
  {
    id: "beige-sandals-occasion",
    code: "SM-1403",
    name: "Beige leather sandals",
    colour: "Beige",
    category: "formal",
    condition: "new",
    price: 1500,
    sizes: ["36", "37", "38", "39", "40"],
    stock: 5,
    images: ["photo-1515965230482-0b9b46fbee14"],
    note: "Hand-stitched, for weddings and church.",
    added: "2026-10-04",
  },

  // Kids & family
  {
    id: "kids-weekend-set",
    code: "SM-1501",
    name: "Kids weekend outfit",
    colour: "Mixed",
    category: "kids",
    condition: "new",
    price: 1100,
    sizes: ["2–3 yrs", "4–5 yrs", "6–8 yrs"],
    stock: 6,
    images: ["photo-1791774023109-54667cb235e7"],
    note: "Top and bottoms, easy wash.",
    added: "2026-10-19",
  },
  {
    id: "baby-sneakers",
    code: "SM-1502",
    name: "Baby sneakers",
    colour: "Blue and pink",
    category: "kids",
    condition: "new",
    price: 700,
    sizes: ["19", "20", "21", "22"],
    stock: 8,
    images: ["photo-1624958797025-b119e2fa2b53"],
    note: "Soft soles for first steps. EU sizes.",
    added: "2026-10-25",
  },
  {
    id: "kids-canvas-shoes",
    code: "SM-1503",
    name: "Kids canvas shoes",
    colour: "Beige",
    category: "kids",
    condition: "mtumba",
    price: 500,
    sizes: ["28"],
    stock: 1,
    images: ["photo-1552912276-56ef47874741"],
    note: "Grade A, cleaned.",
    added: "2026-10-07",
  },
  {
    id: "baby-white-shoes",
    code: "SM-1504",
    name: "Baby white shoes",
    colour: "White",
    category: "kids",
    condition: "new",
    price: 650,
    sizes: ["19", "20", "21"],
    stock: 5,
    images: ["photo-1565430076958-f6579417a6ef"],
    added: "2026-10-03",
  },
];

/** Shop delivery in Chuka: free from `freeFrom`, otherwise `fee`. Pick up in store is free. */
export const SHOP_DELIVERY = { freeFrom: 1500, fee: 100 } as const;

export const SHOP_HERO_IMAGE = "photo-1590955256762-e60f6e08122a";

export const CATALOGUE_MESSAGE =
  "Hi Street Mart, please send me today's clothes and shoes catalogue.";

export const productByCode = (code: string | null | undefined) =>
  products.find((p) => p.code.toLowerCase() === code?.toLowerCase());

export const categoryName = (id: ShopCategoryId) => shopCategories.find((c) => c.id === id)!.name;
