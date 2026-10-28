import type { Metadata } from "next";

import { site } from "@/config/site";
import { HomePage } from "@/features/home/components/home-page";
import { HERO_IMAGE_ID } from "@/features/home/data";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "Laundry, Clothing & E-Gikomba in Chuka",
    description:
      "Free laundry pickup, delivery and ironing across Chuka. Our own clothing shop and the E-Gikomba clothes and shoes marketplace at Chuka General.",
    socialDescription:
      "Free pickup, free delivery and free ironing across Chuka — plus our clothing shop and the E-Gikomba marketplace.",
    image: ogImage(HERO_IMAGE_ID),
    path: "/",
  }),
  title: { absolute: `${site.name} — Laundry, Clothing & E-Gikomba in Chuka` },
};

export default function Page() {
  return <HomePage />;
}
