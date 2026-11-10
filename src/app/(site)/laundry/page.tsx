import { LaundryPage } from "@/features/laundry/components/laundry-page";
import { basketFrom } from "@/features/laundry/data";
import { getLiveLaundryItems } from "@/features/laundry/lib/live-items";
import { JsonLd } from "@/features/seo/json-ld";
import { laundryServiceJsonLd } from "@/features/seo/structured-data";
import { ksh } from "@/lib/format";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  const items = await getLiveLaundryItems();
  return pageMetadata({
    title: "Laundry Service in Chuka: Pickup, Ironing & Prices",
    description: `Laundry pickup and delivery for Chuka University, Ndagani and Chuka town. Baskets from ${ksh(basketFrom(items))}, duvets, mats and shoes. Free pickup, ironing and delivery, pay on delivery.`,
    socialDescription:
      "Laundry pickup for Chuka University, Ndagani and Chuka town. Free ironing and delivery, pay on delivery.",
    image: ogImage("photo-1758279744970-b32360a5e907"),
    path: "/laundry",
  });
}

export default async function Page() {
  const items = await getLiveLaundryItems();
  return (
    <>
      <LaundryPage items={items} />
      <JsonLd data={laundryServiceJsonLd(items)} />
    </>
  );
}
