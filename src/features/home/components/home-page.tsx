import { Faq } from "./faq";
import { Hero } from "./hero";
import { ShopRail } from "./shop-rail";
import { Testimonials } from "./testimonials";
import { WhyStreetMart } from "./why-street-mart";

export function HomePage() {
  return (
    <>
      <Hero />
      <ShopRail />
      <WhyStreetMart />
      <Testimonials />
      <Faq />
    </>
  );
}
