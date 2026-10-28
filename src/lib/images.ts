/** Builds an Unsplash CDN URL. `next/image` resizes it further via `sizes`. */
export const unsplash = (path: string, width = 900) =>
  `https://images.unsplash.com/${path}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${width}`;

/** 1200×630 crop for Open Graph / Twitter cards. */
export const ogImage = (path: string) =>
  `https://images.unsplash.com/${path}?crop=entropy&cs=tinysrgb&fm=jpg&q=80&w=1200&h=630&fit=crop`;
