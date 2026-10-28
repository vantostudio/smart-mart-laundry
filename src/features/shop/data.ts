import { unsplash } from "@/lib/images";

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
    image: unsplash("photo-1626913477803-b3c2dae4496e"),
  },
  {
    id: "trendy",
    name: "Campus trends",
    blurb: "Fresh streetwear picked with students in mind.",
    image: unsplash("photo-1563132337-f159f484226c"),
  },
  {
    id: "dresses",
    name: "Dresses & occasion",
    blurb: "Stand-out pieces for church, weddings and events.",
    image: unsplash("photo-1590955256762-e60f6e08122a"),
  },
  {
    id: "formal",
    name: "Suits & formal",
    blurb: "Sharp suits and shoes for work and big days.",
    image: unsplash("photo-1586232902955-df204f34b36e"),
  },
  {
    id: "shoes",
    name: "Shoes",
    blurb: "Sneakers, boots and sandals, tried before you buy.",
    image: unsplash("photo-1560343090-f0409e92791a"),
  },
  {
    id: "kids",
    name: "Kids & family",
    blurb: "Clothes and shoes for the little ones too.",
    image: unsplash("photo-1791774023109-54667cb235e7"),
  },
];
