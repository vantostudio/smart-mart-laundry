import type { Metadata } from "next";

import { site } from "@/config/site";

type PageMeta = {
  /** Page title; the root layout appends " — Street Mart Kenya". */
  title: string;
  description: string;
  /** Shorter line for social cards; defaults to `description`. */
  socialDescription?: string;
  image?: string;
  /** Path of the page, used for the canonical URL. */
  path: string;
};

export function pageMetadata({
  title,
  description,
  socialDescription,
  image,
  path,
}: PageMeta): Metadata {
  const socialTitle = `${title} — ${site.name}`;
  const social = socialDescription ?? description;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description: social,
      type: "website",
      url: path,
      ...(image && { images: [{ url: image, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: social,
      ...(image && { images: [image] }),
    },
  };
}
