import type { MetadataRoute } from "next";

import { siteNav } from "@/config/navigation";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...siteNav.map((l) => l.href)];
  return paths.map((path) => ({
    url: new URL(path, site.url).toString(),
    changeFrequency: "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
