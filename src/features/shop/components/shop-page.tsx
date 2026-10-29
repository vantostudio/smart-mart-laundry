import { Bike, Clock, MapPin, MessageCircle, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

import { InfoItem } from "@/components/shared/info-item";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { unsplash } from "@/lib/images";

import { CATALOGUE_ID, ShopCatalogue, ShopCatalogueFromUrl } from "./shop-catalogue";

const buySteps = [
  {
    icon: ShoppingBag,
    title: "Add it to your bag",
    body: "Pick a size and tap Add. Mtumba pieces are one of a kind, so don't wait too long.",
  },
  {
    icon: MessageCircle,
    title: "Send it on WhatsApp",
    body: "Your bag goes to us as one message with item codes. We confirm everything is still here.",
  },
  {
    icon: Bike,
    title: "Delivered, or ready to try on",
    body: "A rider brings it to your gate, hostel or office, or pick it up at Chuka General. Pay on delivery.",
  },
];

export function ShopPage() {
  return (
    <>
      {/* Filters live in the URL; until the client reads it, show the whole catalogue. */}
      <Suspense fallback={<ShopCatalogue params={null} />}>
        <ShopCatalogueFromUrl />
      </Suspense>

      <Section
        tone="brand"
        containerClassName="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16"
      >
        <div className="min-w-0">
          <SectionHeading
            align="left"
            title="How buying works"
            intro="No stall-hopping in the sun. The shop comes to your phone, and the rider comes to you."
          />
          <div className="mt-8 hidden lg:block">
            <Button asChild variant="inverse" size="lg">
              <a href={`#${CATALOGUE_ID}`}>Browse the shop</a>
            </Button>
          </div>
        </div>
        <ol className="min-w-0 border-t border-border">
          {buySteps.map((s, i) => (
            <li
              key={s.title}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-border py-5 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:gap-x-5 sm:py-6 lg:py-7"
            >
              <span aria-hidden className="display text-title text-muted-foreground figures">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="display text-title">{s.title}</h3>
                <p className="mt-1.5 max-w-md text-body-sm text-muted-foreground">{s.body}</p>
              </div>
              <s.icon aria-hidden className="hidden size-5 text-muted-foreground sm:block" />
            </li>
          ))}
        </ol>
        <div className="lg:hidden">
          <Button asChild variant="inverse" size="lg">
            <a href={`#${CATALOGUE_ID}`}>Browse the shop</a>
          </Button>
        </div>
      </Section>

      <Section
        id="visit"
        containerClassName="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-16"
      >
        <div className="min-w-0">
          <SectionHeading
            align="left"
            title="Come and try it on"
            intro="We are right at Chuka General, next to the main stage. Prices are marked in shop, and our team will help you find your size."
          />
          <ul className="mt-8 space-y-5">
            <InfoItem icon={MapPin} title={site.location.point}>
              {site.location.country}
            </InfoItem>
            <InfoItem icon={Clock} title="Opening hours">
              {site.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}
            </InfoItem>
            <InfoItem icon={MessageCircle} title="Ask what's in stock">
              Send us a WhatsApp message and we reply the same day.
            </InfoItem>
          </ul>
          <WhatsAppButton
            message="Hi Street Mart, what's in stock at the shop right now?"
            variant="outline"
            size="lg"
            className="mt-8"
          >
            Ask on WhatsApp
          </WhatsAppButton>
        </div>
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl bg-muted sm:aspect-16/9 lg:aspect-5/4">
          <Image
            src={unsplash("photo-1563132337-f159f484226c", 1000)}
            alt="Campus trendy wear from the shop"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </Section>
    </>
  );
}
