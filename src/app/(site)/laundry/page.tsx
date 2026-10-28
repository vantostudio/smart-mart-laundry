import { LaundryPage } from "@/features/laundry/components/laundry-page";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Laundry & Prices",
  description:
    "Laundry prices in Chuka: baskets from KSh 150, duvets, mats and shoes. Free pickup, delivery and ironing — pay on delivery, cash or M-Pesa.",
  socialDescription:
    "Free pickup, delivery and ironing across Chuka. Clear prices — pay on delivery.",
  image: ogImage("photo-1758279744970-b32360a5e907"),
  path: "/laundry",
});

export default function Page() {
  return <LaundryPage />;
}
