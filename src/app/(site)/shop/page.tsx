import { ShopPage } from "@/features/shop/components/shop-page";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Clothing Shop",
  description:
    "Our own clothing shop at Chuka General — everyday wear, campus trends, dresses, suits and shoes. Visit us or ask on WhatsApp.",
  socialDescription: "Everyday wear, campus trends, dresses, suits and shoes at Chuka General.",
  image: ogImage("photo-1590955256762-e60f6e08122a"),
  path: "/shop",
});

export default function Page() {
  return <ShopPage />;
}
