import { EgikombaPage } from "@/features/egikomba/components/egikomba-page";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "E-Gikomba Marketplace",
  description:
    "E-Gikomba at Chuka General: mtumba and brand new clothes and shoes for ladies, men, kids and campus — browsed on WhatsApp, delivered by Street Mart riders.",
  socialDescription:
    "Mtumba and new clothes and shoes, delivered by Street Mart riders across Chuka.",
  image: ogImage("photo-1720343354398-89c6aa6d12a4"),
  path: "/egikomba",
});

export default function Page() {
  return <EgikombaPage />;
}
