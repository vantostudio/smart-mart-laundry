import { unsplash } from "@/lib/images";

/** Unsplash photos (free Unsplash License) for the about-page collage, largest first. */
export const aboutPhotos = [
  {
    src: unsplash("photo-1696546761269-a8f9d2b80512", 1000),
    alt: "A laundry room with a basket of fresh linen in front of the washing machines",
  },
  {
    src: unsplash("photo-1635274605638-d44babc08a4f", 600),
    alt: "Stacks of freshly washed, folded shirts",
  },
  {
    src: unsplash("photo-1563132337-f159f484226c", 600),
    alt: "Campus trendy wear from the shop",
  },
] as const;
