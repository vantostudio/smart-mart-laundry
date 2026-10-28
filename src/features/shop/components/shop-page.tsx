import { ArrowRight, Clock, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Card, CardBody, CardMedia } from "@/components/shared/card";
import { InfoItem } from "@/components/shared/info-item";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { shopHighlights } from "@/features/shop/data";
import { unsplash } from "@/lib/images";

export function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Our shop"
        title="Clothing picked for Chuka"
        intro="Our own clothing shop at Chuka General — walk in, try it on, walk out with it. Mtumba and brand new, hand-picked for quality and price."
        chips={["Mtumba & brand new", "Try before you buy", "Clothes & shoes"]}
        image={{
          src: unsplash("photo-1590955256762-e60f6e08122a", 1000),
          alt: "A woman browsing colourful clothing",
        }}
      />

      <Section spacing="bottom">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {shopHighlights.map((s, i) => (
            <Card key={s.id} asChild variant="interactive" padding="none">
              <article>
                <CardMedia
                  src={s.image}
                  alt={s.name}
                  aspect="4/5"
                  priority={i < 2}
                  sizes="(min-width: 768px) 33vw, 50vw"
                />
                <CardBody>
                  <h2 className="text-subtitle font-semibold">{s.name}</h2>
                  <p className="mt-1 text-body-sm text-muted-foreground">{s.blurb}</p>
                </CardBody>
              </article>
            </Card>
          ))}
        </div>
      </Section>

      <Section tone="muted" containerClassName="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Visit us"
            title="Come and see it in person"
            intro="We are right at Chuka General, next to the main stage. Prices are marked in shop, and our team will help you find your size."
          />
          <ul className="mt-8 space-y-5">
            <InfoItem icon={MapPin} title={site.location.point}>
              {site.location.area}, {site.location.country}
            </InfoItem>
            <InfoItem icon={Clock} title="Opening hours">
              {site.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}
            </InfoItem>
            <InfoItem icon={MessageCircle} title="Ask what's in stock">
              Send us a WhatsApp message and we reply the same day.
            </InfoItem>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <WhatsAppButton message="Hi Street Mart, what's in stock at the shop right now?">
              Ask on WhatsApp
            </WhatsAppButton>
            <Button asChild variant="outline">
              <Link href="/egikomba">
                Browse E-Gikomba <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div
            aria-hidden
            className="absolute -top-4 -left-4 size-full -rotate-2 rounded-3xl bg-gradient-forest opacity-20"
          />
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl shadow-lift">
            <Image
              src={unsplash("photo-1563132337-f159f484226c", 1000)}
              alt="Campus trendy wear from the shop"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>
    </>
  );
}
