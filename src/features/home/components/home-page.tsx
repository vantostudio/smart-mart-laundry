import { ArrowRight, CalendarClock, Quote, Sparkles, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Card } from "@/components/shared/card";
import { CtaBanner } from "@/components/shared/cta-banner";
import { DetailList } from "@/components/shared/detail-list";
import { FeatureCard } from "@/components/shared/feature-card";
import { ImageTile } from "@/components/shared/image-tile";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { egikombaCategories } from "@/features/egikomba/data";
import { HERO_IMAGE_ID, howSteps, testimonials, tourSteps } from "@/features/home/data";
import { PriceGroupCard } from "@/features/laundry/components/price-group-card";
import { priceGroups, promises } from "@/features/laundry/data";
import { unsplash } from "@/lib/images";
import { cn } from "@/lib/utils";

const promiseIcons = [Truck, Sparkles, CalendarClock];

const heroPerks = [
  { icon: Truck, label: "Free pickup & delivery" },
  { icon: Sparkles, label: "Free ironing" },
  { icon: CalendarClock, label: "Same day or next day" },
];

const heroTicket = [
  ["Service", "Wash, dry & iron"],
  ["Items", "1 medium basket, 1 duvet 4×6"],
  ["Pickup", "Today, 9:30 AM"],
  ["Return by", "Tomorrow, 6:00 PM"],
  ["Total", "KSh 500"],
] as const;

function Hero() {
  return (
    <section className="relative overflow-hidden bg-glow">
      <div className="container-page grid gap-12 pt-12 pb-20 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-20 lg:pb-28">
        <div className="animate-fade-up">
          <Badge variant="chip" className="gap-2">
            <span className="size-1.5 animate-pulse rounded-full bg-clay" aria-hidden />
            Chuka · Tharaka Nithi County
          </Badge>
          <h1 className="mt-5 display text-display-xl">
            Laundry day, <span className="text-gradient-sunset">handled.</span>
          </h1>
          <p className="mt-5 max-w-md text-body-lg text-muted-foreground">
            We collect your clothes from your gate, wash, dry and press them with care, and return
            everything before the deadline you set. Pickup, delivery and ironing are free on every
            basket.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gradient-clay" size="lg">
              <Link href="/laundry">
                Order a pickup <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/laundry#prices">View pricing</Link>
            </Button>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 text-body-sm font-medium">
            {heroPerks.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon className="size-4 text-clay" aria-hidden /> {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <div
            aria-hidden
            className="absolute -top-6 -right-6 size-40 rounded-full bg-gradient-sunset opacity-30 blur-3xl"
          />
          <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl shadow-lift ring-1 ring-foreground/5">
            <Image
              src={unsplash(HERO_IMAGE_ID, 1000)}
              alt="A laundry basket full of clean folded clothes"
              fill
              priority
              sizes="(min-width: 1152px) 520px, (min-width: 1024px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          <Card
            variant="ticket"
            className="relative mx-auto -mt-16 w-[92%] sm:mx-0 sm:-mt-20 sm:w-[80%] lg:absolute lg:-bottom-12 lg:-left-8 lg:w-[75%]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-border pb-3">
              <p className="font-display text-body font-semibold">Sample laundry ticket</p>
              <Badge variant="code">SM-48217</Badge>
            </div>
            <DetailList items={heroTicket} className="py-1" />
            <div className="mt-1 flex items-center gap-2 rounded-xl bg-gradient-primary px-3.5 py-2.5 text-body-sm font-medium text-primary-foreground inset-shadow-highlight">
              <span className="size-2 animate-pulse rounded-full bg-clay" aria-hidden />
              Washing — rider on schedule
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Promises() {
  return (
    <Section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promises.map((p, i) => (
          <FeatureCard
            key={p.title}
            icon={promiseIcons[i] ?? Sparkles}
            title={p.title}
            body={p.body}
          />
        ))}
      </div>
    </Section>
  );
}

function HowItWorks() {
  return (
    <Section tone="muted">
      <SectionHeading
        eyebrow="How it works"
        title="Four steps, zero effort"
        intro="Book once and we take it from there — collection, cleaning and delivery back to your door."
      />
      <ol className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {howSteps.map((step, i) => (
          <li key={step.title} className="flex">
            <FeatureCard step={i + 1} title={step.title} body={step.body} className="w-full" />
          </li>
        ))}
      </ol>
    </Section>
  );
}

function Tour() {
  return (
    <Section>
      <SectionHeading
        eyebrow="See it in motion"
        title="A day at Street Mart"
        intro="Free pickup, careful washing, free ironing and delivery back to your door across Chuka."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tourSteps.map((step, i) => (
          <ImageTile
            key={step.title}
            image={step.image}
            title={step.title}
            caption={step.body}
            aspect="3/4"
            sizes="(min-width: 1024px) 25vw, 50vw"
            className={cn(i % 2 === 1 && "lg:translate-y-8")}
          />
        ))}
      </div>
    </Section>
  );
}

function PricingTeaser() {
  const [baskets, duvets] = priceGroups;
  return (
    <Section tone="muted">
      <SectionHeading
        eyebrow="Laundry prices"
        title="Clear prices, no hidden charges"
        intro="Ironing, pickup and delivery are always free. Pay on delivery — cash or M-Pesa."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.85fr]">
        {baskets && <PriceGroupCard group={baskets} />}
        {duvets && <PriceGroupCard group={duvets} />}
        <Card variant="brand" padding="lg" className="justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <h3 className="text-title font-semibold">Every price, one place</h3>
            <p className="mt-2 text-body-sm text-muted-foreground">
              Duvets, mats, shoes and every basket size — the full list is on the laundry page,
              where you can also book your pickup.
            </p>
          </div>
          <Button asChild variant="inverse" className="mt-8 self-start">
            <Link href="/laundry#prices">
              Full price list <ArrowRight />
            </Link>
          </Button>
        </Card>
      </div>
    </Section>
  );
}

function EgikombaTeaser() {
  return (
    <Section tone="brand">
      <SectionHeading
        eyebrow="E-Gikomba"
        title="Clothes & shoes, mtumba and new"
        intro="Our marketplace at Chuka General — browsed on WhatsApp, delivered by Street Mart riders."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {egikombaCategories.map((c, i) => (
          <ImageTile
            key={c.id}
            image={c.image}
            title={c.name}
            caption={c.caption}
            href="/egikomba"
            className={cn(i === 4 && "col-span-2 md:col-span-1")}
          />
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button asChild variant="inverse" size="lg">
          <Link href="/egikomba">
            Explore E-Gikomba <ArrowRight />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

function Testimonials() {
  return (
    <Section>
      <SectionHeading
        eyebrow="What customers say"
        title="Chuka keeps coming back"
        intro="Households, students and workers across Chuka and the wider Tharaka Nithi County."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Card key={t.name} asChild variant={i === 1 ? "brand" : "default"} padding="lg">
            <figure>
              <Quote className="size-7 text-clay" aria-hidden />
              <blockquote className="mt-4 flex-1 text-body">{t.quote}</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
                <span
                  aria-hidden
                  className="flex size-10 items-center justify-center rounded-full bg-gradient-sunset font-display font-bold text-clay-foreground"
                >
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-body-sm font-semibold">{t.name}</span>
                  <span className="block text-caption text-muted-foreground">{t.where}</span>
                </span>
              </figcaption>
            </figure>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function ClosingCta() {
  return (
    <Section spacing="bottom">
      <CtaBanner
        eyebrow="Pay on delivery"
        title="Ready when you are"
        body="Book a pickup online or on WhatsApp — pay only when your clothes are back in your hands."
        actions={
          <>
            <Button asChild variant="gradient-sunset" size="lg">
              <Link href="/laundry">
                Order a pickup <ArrowRight />
              </Link>
            </Button>
            <WhatsAppButton variant="outline-inverse" size="lg">
              Talk to us
            </WhatsAppButton>
          </>
        }
        footnote={`${site.location.point} · ${site.location.area}`}
      />
    </Section>
  );
}

export function HomePage() {
  return (
    <>
      <Hero />
      <Promises />
      <HowItWorks />
      <Tour />
      <PricingTeaser />
      <EgikombaTeaser />
      <Testimonials />
      <ClosingCta />
    </>
  );
}
