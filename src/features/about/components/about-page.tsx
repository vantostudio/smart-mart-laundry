import { ArrowRight, Bike, Clock, Mail, MapPin, Phone, Shirt, Sparkles } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/shared/card";
import { InfoItem } from "@/components/shared/info-item";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { site } from "@/config/site";
import { aboutPhotos } from "@/features/about/data";
import { promises } from "@/features/laundry/data";
import { cn } from "@/lib/utils";

const pillars: {
  icon: typeof Sparkles;
  title: string;
  body: string;
  href?: Route;
  cta?: string;
}[] = [
  {
    icon: Sparkles,
    title: "Laundry",
    body: "Free pickup, careful washing, free ironing and delivery back to your door — across Chuka.",
    href: "/laundry",
    cta: "Book pickup",
  },
  {
    icon: Shirt,
    title: "Shop",
    body: "Mtumba and brand new clothes and shoes from our counter and trusted local sellers — hand-picked and priced for students.",
    href: "/shop",
    cta: "Browse the shop",
  },
  {
    icon: Bike,
    title: "Rider delivery",
    body: "Our own riders collect and deliver every laundry basket and shop order, right to your gate or hostel.",
  },
];

function Photo({
  photo,
  sizes,
  className,
}: {
  photo: (typeof aboutPhotos)[number];
  sizes: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-muted", className)}>
      <Image src={photo.src} alt={photo.alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

export function AboutPage() {
  const [big, folded, shop] = aboutPhotos;
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Clean clothes, good clothes, one counter"
        intro="Street Mart Kenya started at Chuka General with one idea: everyday services — clean clothes and good clothes — should come to you, not the other way around."
      />

      <Section
        spacing="bottom"
        containerClassName="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-12 lg:items-center lg:gap-16"
      >
        {/* Asymmetric collage: one tall photo, two smaller ones stepping down beside it. */}
        <div className="grid min-w-0 grid-cols-5 gap-3 sm:gap-4 lg:col-span-7 lg:gap-5">
          <Photo
            photo={big}
            sizes="(min-width: 1152px) 380px, (min-width: 1024px) 33vw, 60vw"
            className="col-span-3 row-span-2 min-h-full"
          />
          <Photo
            photo={folded}
            sizes="(min-width: 1024px) 260px, 40vw"
            className="col-span-2 mt-8 aspect-square sm:mt-12"
          />
          <Photo
            photo={shop}
            sizes="(min-width: 1024px) 260px, 40vw"
            className="col-span-2 aspect-4/5"
          />
        </div>

        <ul className="min-w-0 border-t border-border lg:col-span-5">
          {pillars.map((p) => (
            <li key={p.title} className="border-b border-border py-5 sm:py-6">
              <div className="flex items-center gap-3">
                <p.icon aria-hidden className="size-5 shrink-0 text-clay" />
                <h3 className="display text-title">{p.title}</h3>
              </div>
              <p className="mt-2 text-body-sm text-muted-foreground">{p.body}</p>
              {p.href && (
                <Link
                  href={p.href}
                  className="group -mb-2 inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-primary"
                >
                  {p.cta}
                  <ArrowRight
                    aria-hidden
                    className="size-4 transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section className="border-t border-border/70">
        <SectionHeading
          align="left"
          title="Free where it counts"
          intro="Every laundry basket includes pickup, delivery and ironing at no extra cost — and you only pay when your clothes are back in your hands."
        />
        {/* Middle card steps down on wider screens so the row reads as a staircase, not a table. */}
        <ol className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4 sm:pb-10 lg:gap-6 lg:pb-14">
          {promises.map((p, i) => (
            <li
              key={p.title}
              className={cn("min-w-0", i === 1 && "sm:translate-y-10 lg:translate-y-14")}
            >
              <Card radius="xl" className="h-full shadow-none lg:p-7">
                <span aria-hidden className="display text-display text-muted-foreground/40 figures">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 display text-title sm:mt-6">{p.title}</h3>
                <p className="mt-2 text-body-sm text-muted-foreground">{p.body}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        className="border-t border-border/70"
        containerClassName="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-center lg:gap-16"
      >
        <SectionHeading
          align="left"
          title="Chuka General, next to the main stage"
          intro="Right in the middle of things — stop by the shop, drop off a question, or watch the riders head out for their next pickup."
        />
        <Card radius="xl" className="min-w-0 p-5 sm:p-6 lg:p-8">
          <ul className="space-y-5">
            <InfoItem icon={MapPin} title={site.location.point}>
              {site.location.country}
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
              <a
                href={`tel:+${site.whatsapp}`}
                className="-my-3 inline-flex min-h-11 items-center transition-colors hover:text-clay"
              >
                {site.phoneDisplay}
              </a>
            </InfoItem>
            <InfoItem icon={Mail} title="Email">
              <a
                href={`mailto:${site.email}`}
                className="-my-3 inline-flex min-h-11 items-center break-all transition-colors hover:text-clay"
              >
                {site.email}
              </a>
            </InfoItem>
          </ul>
          <WhatsAppButton variant="clay" size="lg" block className="mt-6 sm:mt-8">
            Chat on WhatsApp
          </WhatsAppButton>
        </Card>
      </Section>
    </>
  );
}
