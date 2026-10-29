import { AboutPage } from "@/features/about/components/about-page";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "About Street Mart, Chuka",
  description:
    "Street Mart Kenya is a laundry pickup and delivery service and a clothes and shoes shop at Chuka General, serving Chuka University, Ndagani and Chuka town.",
  socialDescription: "Laundry pickup and a clothes & shoes shop — both from Chuka General.",
  path: "/about",
});

export default function Page() {
  return <AboutPage />;
}
