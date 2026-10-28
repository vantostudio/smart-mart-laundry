import { Clock, Mail, MapPin, Phone, Shirt, Sparkles, Store } from "lucide-react";
import type { Route } from "next";

import { Card } from "@/components/shared/card";
import { FeatureCard } from "@/components/shared/feature-card";
import { InfoItem } from "@/components/shared/info-item";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { site } from "@/config/site";
import { promises } from "@/features/laundry/data";

const pillars: { icon: typeof Sparkles; title: string; body: string; href: Route }[] = [
  {
    icon: Sparkles,
    title: "Laundry",
    body: "Free pickup, careful washing, free ironing and delivery back to your door — across Chuka and the wider county.",
    href: "/laundry",
  },
  {
    icon: Shirt,
    title: "Clothing shop",
    body: "Our own shop at Chuka General — mtumba and brand new clothes and shoes, hand-picked and fairly priced.",
    href: "/shop",
  },
  {
    icon: Store,
    title: "E-Gikomba",
    body: "A marketplace for local sellers — we list, market and deliver every order so sellers can focus on stock.",
    href: "/egikomba",
  },
];

export function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Three businesses, one counter"
        intro="Street Mart Kenya started at Chuka General with one idea: everyday services — clean clothes, good clothes, working marketplaces — should come to you, not the other way around."
      />

      <Section spacing="bottom">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <FeatureCard key={p.title} icon={p.icon} title={p.title} body={p.body} href={p.href} />
          ))}
        </div>
      </Section>

      <Section tone="muted">
        <SectionHeading
          eyebrow="What we promise"
          title="Free where it counts"
          intro="Every laundry basket includes pickup, delivery and ironing at no extra cost — and you only pay when your clothes are back in your hands."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {promises.map((p, i) => (
            <FeatureCard key={p.title} step={i + 1} title={p.title} body={p.body} />
          ))}
        </div>
      </Section>

      <Section containerClassName="grid gap-12 lg:grid-cols-2 lg:items-center">
        <SectionHeading
          align="left"
          eyebrow="Where to find us"
          title="Chuka General, next to the main stage"
          intro="Right in the middle of things — stop by the shop, drop off a question, or watch the riders head out for their next pickup."
        />
        <Card variant="brand" radius="xl" padding="lg">
          <ul className="space-y-5">
            <InfoItem icon={MapPin} title={site.location.point}>
              {site.location.area}, {site.location.country}
            </InfoItem>
            <InfoItem icon={Clock} title="Opening hours">
              {site.hours.map((h) => (
                <p key={h.days}>
                  {h.days}: {h.time}
                </p>
              ))}
              <p className="mt-1 text-caption">{site.hoursNote}</p>
            </InfoItem>
            <InfoItem icon={Phone} title="Call or WhatsApp">
              <a href={`tel:+${site.whatsapp}`} className="transition-colors hover:text-clay">
                {site.phoneDisplay}
              </a>
            </InfoItem>
            <InfoItem icon={Mail} title="Email">
              <a href={`mailto:${site.email}`} className="transition-colors hover:text-clay">
                {site.email}
              </a>
            </InfoItem>
          </ul>
          <WhatsAppButton variant="gradient-sunset" block className="mt-8">
            Chat on WhatsApp
          </WhatsAppButton>
        </Card>
      </Section>
    </>
  );
}
