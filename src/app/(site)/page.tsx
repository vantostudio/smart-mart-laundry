import type { Metadata } from "next";

import { site } from "@/config/site";
import { HomePage } from "@/features/home/components/home-page";
import { HERO_IMAGE_ID } from "@/features/home/data";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Laundry & Clothes in Chuka",
    description:
      "Free laundry pickup, delivery and ironing across Chuka. Plus mtumba and brand new clothes and shoes from our shop at Chuka General.",
    socialDescription:
      "Free pickup, free delivery and free ironing across Chuka — plus clothes and shoes from our shop.",
    image: ogImage(HERO_IMAGE_ID),
    path: "/",
  }),
  title: { absolute: `${site.name} — Laundry & Clothes in Chuka` },
};

export default function Page() {
  return <HomePage />;
}
