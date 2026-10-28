import { AboutPage } from "@/features/about/components/about-page";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Street Mart Kenya is a laundry pickup and delivery service, a clothing shop and the E-Gikomba marketplace — all based at Chuka General, Tharaka Nithi County.",
  socialDescription:
    "Laundry, clothing shop and the E-Gikomba marketplace — all from Chuka General.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
