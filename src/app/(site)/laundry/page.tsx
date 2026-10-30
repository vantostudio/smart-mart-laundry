import { LaundryPage } from "@/features/laundry/components/laundry-page";
import { JsonLd } from "@/features/seo/json-ld";
import { laundryServiceJsonLd } from "@/features/seo/structured-data";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Laundry Service in Chuka: Pickup, Ironing & Prices",
  description:
    "Laundry pickup and delivery for Chuka University, Ndagani and Chuka town. Baskets from KSh 150, duvets, mats and shoes. Free pickup, ironing and delivery, pay on delivery.",
  socialDescription:
    "Laundry pickup for Chuka University, Ndagani and Chuka town. Free ironing and delivery, pay on delivery.",
  image: ogImage("photo-1758279744970-b32360a5e907"),
  path: "/laundry",
});

export default function Page() {
  return (
    <>
      <LaundryPage />
      <JsonLd data={laundryServiceJsonLd()} />
    </>
  );
}
