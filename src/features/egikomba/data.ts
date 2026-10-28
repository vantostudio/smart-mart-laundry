import { unsplash } from "@/lib/images";

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
    image: unsplash("photo-1720343354398-89c6aa6d12a4"),
  },
  {
    id: "men",
    name: "Men wear",
    caption: "Shirts, jeans and everyday wear",
    image: unsplash("photo-1626913477803-b3c2dae4496e"),
  },
  {
    id: "kids",
    name: "Kids wear",
    caption: "Children's clothing, all sizes",
    image: unsplash("photo-1791774023109-54667cb235e7"),
  },
  {
    id: "campus",
    name: "Campus trendy wear",
    caption: "Streetwear for students, priced for campus",
    image: unsplash("photo-1563132337-f159f484226c"),
  },
  {
    id: "suits",
    name: "Suit wear",
    caption: "Formal suits and occasion wear",
    image: unsplash("photo-1586232902955-df204f34b36e"),
  },
];
