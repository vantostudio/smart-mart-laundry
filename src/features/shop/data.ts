import { categoryLabels } from "@/features/products/labels";
import { unsplash } from "@/lib/images";
import type { ProductCategory } from "@/lib/db/schema";

/*
 * The shop's aisles and imagery. Products themselves come from `/api/products`. Stock comes from
 * our own counter at Chuka General and from local sellers; customers don't need to know which.
 */

type ShopCategory = { id: ProductCategory; name: string; image: string };

export const shopCategories: ShopCategory[] = [
  {
    id: "ladies",
    name: categoryLabels.ladies,
    image: unsplash("photo-1720343354398-89c6aa6d12a4"),
  },
  {
    id: "men",
    name: categoryLabels.men,
    image: unsplash("photo-1626913477803-b3c2dae4496e"),
  },
  {
    id: "shoes",
    name: categoryLabels.shoes,
    image: unsplash("photo-1560343090-f0409e92791a"),
  },
];

export const SHOP_HERO_IMAGE = "photo-1590955256762-e60f6e08122a";
