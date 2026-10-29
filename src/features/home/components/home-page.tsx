import { Faq } from "./faq";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { ShopTeaser } from "./shop-teaser";
import { Testimonials } from "./testimonials";
import { WhyStreetMart } from "./why-street-mart";

export function HomePage() {
  return (
    <>
      <Hero />
      <WhyStreetMart />
      <HowItWorks />
      <Testimonials />
      <ShopTeaser />
      <Faq />
    </>
  );
}
