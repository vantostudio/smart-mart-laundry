import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Quote,
  Sparkles,
  Truck,
} from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CategoryCard } from "@/components/category-card";
import { PriceGroupCard } from "@/components/price-group-card";
import { Button } from "@/components/ui/button";
import { priceGroups } from "@/data/laundry";
import { egikombaCategories } from "@/data/market";
import { howSteps, promises, testimonials, tourSteps } from "@/data/content";
import { site, waLink, WHATSAPP_ORDER_DEFAULT } from "@/data/site";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1780253200136-77514727a5da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop";

const promiseIcons = [Truck, Sparkles, CalendarClock];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Street Mart Kenya — Laundry, Clothing & E-Gikomba in Chuka" },
      {
        name: "description",
        content:
          "Free laundry pickup, delivery and ironing across Chuka. Our own clothing shop and the E-Gikomba clothes and shoes marketplace at Chuka General.",
      },
      { property: "og:title", content: "Street Mart Kenya — Laundry, Clothing & E-Gikomba in Chuka" },
      {
        property: "og:description",
        content:
          "Free pickup, free delivery and free ironing across Chuka — plus our clothing shop and the E-Gikomba marketplace.",
      },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:image", content: HERO_IMAGE },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Home,
});

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <p className="eyebrow">Chuka · Tharaka Nithi County</p>
          <h1 className="display mt-3 text-4xl sm:text-5xl lg:text-6xl">
            Laundry day,{" "}
            <span className="italic text-clay">handled.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            We collect your clothes from your gate, wash, dry and press them with
            care, and return everything before the deadline you set. Pickup,
            delivery and ironing are free on every basket.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7 text-base">
              <Link to="/laundry">Order a pickup</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="rounded-full border-foreground/20 px-7 text-base hover:bg-secondary"
            >
              <Link to="/laundry">View pricing</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-5 text-sm font-medium">
            <li className="flex items-center gap-2">
              <Truck className="size-4 text-clay" /> Free pickup &amp; delivery
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="size-4 text-clay" /> Free ironing
            </li>
            <li className="flex items-center gap-2">
              <CalendarClock className="size-4 text-clay" /> Same day or next day
            </li>
          </ul>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <img
            src="https://images.unsplash.com/photo-1780253200136-77514727a5da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000"
            alt="A laundry basket full of clean folded clothes"
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="relative mx-auto -mt-16 w-[92%] rounded-2xl border border-border bg-card p-5 shadow-ticket sm:mx-0 sm:-mt-20 sm:w-[80%] lg:absolute lg:-bottom-10 lg:-left-6 lg:w-[75%]">
            <div className="flex items-center justify-between gap-3 border-b border-dashed border-border pb-3">
              <p className="font-display text-base font-semibold">Sample laundry ticket</p>
              <span className="rounded-full bg-clay-soft px-2.5 py-1 text-xs font-bold tracking-wide text-accent-foreground">
                SM-48217
              </span>
            </div>
            <dl className="py-2 text-sm">
              {[
                ["Service", "Wash, dry & iron"],
                ["Items", "1 medium basket, 1 duvet 4×6"],
                ["Pickup", "Today, 9:30 AM"],
                ["Return by", "Tomorrow, 6:00 PM"],
                ["Total", "KSh 500"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between gap-3 py-1.5 not-last:border-b border-border/70"
                >
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground">
              <span className="size-2 animate-pulse rounded-full bg-clay" aria-hidden />
              Washing — rider on schedule
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Promises() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promises.map((p, i) => {
          const Icon = promiseIcons[i] ?? Sparkles;
          return (
            <div
              key={p.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-clay-soft">
                <Icon className="size-5 text-accent-foreground" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="bg-secondary/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="Four steps, zero effort"
          intro="Book once and we take it from there — collection, cleaning and delivery back to your door."
        />
        <ol className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {howSteps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-base font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="mt-3.5 font-display text-base font-semibold leading-snug">
                {step.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Tour() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="See it in motion"
        title="A day at Street Mart"
        intro="Free pickup, careful washing, free ironing and delivery back to your door across Chuka."
      />
      <div className="mt-10 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {tourSteps.map((step, i) => (
          <figure key={step.title} className="group relative overflow-hidden rounded-2xl shadow-card">
            <img
              src={step.image}
              alt={step.title}
              loading={i > 1 ? "lazy" : undefined}
              className="aspect-[3/4] size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-primary/90 via-primary/35 to-transparent p-4 pt-12">
              <p className="font-display text-sm font-semibold text-white sm:text-base">
                {step.title}
              </p>
              <p className="mt-0.5 text-[0.7rem] leading-snug text-white/80 sm:text-xs">
                {step.body}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function PricingTeaser() {
  return (
    <section className="bg-secondary/60 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Laundry prices"
          title="Clear prices, no hidden charges"
          intro="Ironing, pickup and delivery are always free. Pay on delivery — cash or M-Pesa."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr]">
          <PriceGroupCard group={priceGroups[0]!} />
          <PriceGroupCard group={priceGroups[1]!} />
          <div className="flex flex-col justify-between rounded-2xl bg-primary p-6 text-primary-foreground">
            <div>
              <h3 className="font-display text-xl font-semibold">Every price, one place</h3>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Duvets, mats, shoes and every basket size — the full list is on the
                laundry page, where you can also book your pickup.
              </p>
            </div>
            <Button asChild variant="secondary" className="mt-6 rounded-full text-primary">
              <Link to="/laundry" className="gap-1.5">
                Full price list <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function EgikombaTeaser() {
  return (
    <section className="bg-primary py-16 text-primary-foreground sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          tone="on-dark"
          eyebrow="E-Gikomba"
          title="Clothes & shoes, mtumba and new"
          intro="Our marketplace at Chuka General — browsed on WhatsApp, delivered by Street Mart riders."
        />
        <div className="mt-10 grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
          {egikombaCategories.map((c, i) => (
            <div key={c.id} className={i === 4 ? "col-span-2 md:col-span-1" : ""}>
              <CategoryCard image={c.image} name={c.name} caption={c.caption} />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            asChild
            variant="secondary"
            className="rounded-full px-7 text-primary"
          >
            <Link to="/egikomba" className="gap-1.5">
              Explore E-Gikomba <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHeading
        eyebrow="What customers say"
        title="Chuka keeps coming back"
        intro="Households, students and workers across Chuka and the wider Tharaka Nithi County."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote
            key={t.name}
            className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <Quote className="size-6 text-clay" aria-hidden />
            <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
              {t.quote}
            </p>
            <footer className="mt-4 border-t border-border pt-3.5 text-sm">
              <p className="font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.where}</p>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function ClosingCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
        <h2 className="display text-3xl sm:text-4xl">Ready when you are</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80 sm:text-base">
          Book a pickup online or on WhatsApp — pay on delivery, only when your
          clothes are back in your hands.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary" size="lg" className="rounded-full px-7 text-primary">
            <Link to="/laundry">Order a pickup</Link>
          </Button>
          <a
            href={waLink(WHATSAPP_ORDER_DEFAULT)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary-foreground/35 px-7 text-sm font-semibold transition-colors hover:bg-primary-foreground/10"
          >
            Talk to us
          </a>
        </div>
        <p className="mt-6 text-xs text-primary-foreground/60">
          {site.location.point} · {site.location.area}
        </p>
      </div>
    </section>
  );
}

function Home() {
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
