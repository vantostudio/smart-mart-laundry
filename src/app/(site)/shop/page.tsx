import { ShopPage } from "@/features/shop/components/shop-page";
import { SHOP_HERO_IMAGE } from "@/features/shop/data";
import { ogImage } from "@/lib/images";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Mtumba & New Clothes and Shoes in Chuka",
  description:
    "Mtumba and brand new clothes and shoes at Chuka General: campus trends, dresses, jeans, sneakers, suits and kids wear. Delivered to Chuka University, Ndagani and Chuka town, or try on in store.",
  socialDescription:
    "Mtumba and new clothes and shoes in Chuka — browse on WhatsApp, delivered to your gate.",
  image: ogImage(SHOP_HERO_IMAGE),
  path: "/shop",
});

export default function Page() {
  return <ShopPage />;
}
