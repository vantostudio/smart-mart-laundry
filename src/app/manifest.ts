import type { MetadataRoute } from "next";

import { site } from "@/config/site";

/** Name, icon and colours when the site is added to a phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Street Mart",
    description: site.description,
    start_url: "/",
    display: "standalone",
    // Browser chrome can't read CSS variables — keep in sync with --cream-100 in globals.css.
    background_color: "#f7f3ea",
    theme_color: "#f7f3ea",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
