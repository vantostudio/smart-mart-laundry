import { AboutPage } from "@/features/about/components/about-page";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About Us",
  description:
    "Street Mart Kenya is a laundry pickup and delivery service and a clothes and shoes shop — both based at Chuka General.",
  socialDescription: "Laundry pickup and a clothes & shoes shop — both from Chuka General.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
