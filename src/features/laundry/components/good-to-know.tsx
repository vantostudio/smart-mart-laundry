import { BedDouble, Check, Clock, Footprints, Layers, Phone, type LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

import { MobilePaymentsIllustration } from "@/components/illustrations/mobile-payments";
import { Price } from "@/components/shared/price";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { phoneHref, site } from "@/config/site";
import { homeImages } from "@/features/home/data";
import {
  laundryItems,
  priceGroups,
  turnaroundOptions,
  type LaundryCategory,
} from "@/features/laundry/data";
import { ksh } from "@/lib/format";
import { unsplash } from "@/lib/images";
import { cn } from "@/lib/utils";

const baskets = laundryItems.filter((i) => i.category === "baskets");
const basketFrom = Math.min(...baskets.map((b) => b.price));

// Bar heights for the basket size ladder, smallest to largest.
const ladder = ["h-14 sm:h-16", "h-20 sm:h-24", "h-26 sm:h-32", "h-32 sm:h-40"];

const group = (id: LaundryCategory) => priceGroups.find((g) => g.id === id)!;

const tones = {
  card: "bg-card shadow-card",
  accent: "bg-accent",
  success: "bg-success-soft",
};

function Tile({
  tone = "card",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={cn("min-w-0 rounded-3xl p-5 sm:p-6", tones[tone], className)}>
      {children}
    </article>
  );
}

function TileIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-xl bg-card text-primary shadow-card">
      <Icon aria-hidden className="size-5" />
    </span>
  );
}

/** One price group as a compact list; prices drop under the label when the tile is narrow. */
function PriceTile({
  id,
  icon,
  tone,
  className,
}: {
  id: LaundryCategory;
  icon: LucideIcon;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const g = group(id);
  return (
    <Tile tone={tone} className={className}>
      <TileIcon icon={icon} />
      <h3 className="mt-4 display text-title">{g.title}</h3>
      <p className="text-caption text-muted-foreground">{g.note}</p>
      <ul className="mt-3 divide-y divide-dashed divide-foreground/12 text-body-sm">
        {g.items.map((item) => (
          <li
            key={item.label}
            className="flex flex-wrap items-baseline justify-between gap-x-3 py-2"
          >
            <span className="min-w-0">{item.label}</span>
            <Price amount={item.price} size="sm" />
          </li>
        ))}
      </ul>
    </Tile>
  );
}

/** The cheapest-first basket ladder on the brand green: the price list people check most. */
function BasketsTile() {
  return (
    <article className="relative min-w-0 overflow-hidden rounded-4xl bg-mesh p-5 surface-inverse sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h3 className="display text-display">{group("baskets").title}</h3>
          <p className="mt-1 text-body-sm text-muted-foreground">{group("baskets").note}</p>
        </div>
        <p className="text-body-sm text-muted-foreground">
          from <Price amount={basketFrom} size="lg" className="text-foreground" />
        </p>
      </div>

      <ol aria-label="Basket prices" className="mt-6 grid grid-cols-4 items-end gap-2 sm:gap-3">
        {baskets.map((b, i) => (
          <li key={b.id} className="flex min-w-0 flex-col items-center gap-2">
            <span
              aria-hidden
              className={cn(
                "flex w-full items-end justify-center rounded-2xl pb-2.5 display text-title",
                ladder[i],
                b.tag ? "bg-clay text-clay-foreground" : "bg-card",
              )}
            >
              {b.mark}
            </span>
            <span className="sr-only">{b.name}</span>
            <span className="font-display text-caption font-bold tracking-tight whitespace-nowrap figures @sm:text-body">
              {ksh(b.price)}
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-5 text-body-sm text-muted-foreground">
        Most people start with a small basket: a week of clothes for one person.
      </p>
    </article>
  );
}

/** Folded-shirts photo with what's always free, and a tilted "KSh 0" stamp. */
function FreeTile() {
  return (
    <article className="relative isolate min-h-64 min-w-0 overflow-hidden rounded-3xl sm:min-h-72">
      <Image
        src={unsplash(homeImages.folded.id, 900)}
        alt={homeImages.folded.alt}
        fill
        sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
        className="-z-10 object-cover"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-scrim" />

      <p
        aria-hidden
        className="absolute top-4 right-4 flex size-20 rotate-12 flex-col items-center justify-center rounded-full bg-clay text-center leading-none text-clay-foreground shadow-glow-clay sm:size-24"
      >
        <span className="display text-title">KSh 0</span>
        <span className="mt-1 text-caption font-semibold">extra</span>
      </p>

      <div className="absolute inset-x-0 bottom-0 p-5 text-on-media sm:p-6">
        <h3 className="display text-title">Always free</h3>
        <p className="mt-1 text-body-sm opacity-85">Anywhere in Chuka, on every order.</p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {["Pickup", "Delivery", "Ironing"].map((label) => (
            <li
              key={label}
              className="inline-flex items-center gap-1 rounded-full bg-on-media/15 px-2.5 py-1 text-caption font-semibold backdrop-blur-sm"
            >
              <Check aria-hidden className="size-3.5" /> {label}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function SpeedTile() {
  return (
    <Tile>
      <TileIcon icon={Clock} />
      <h3 className="mt-4 display text-title">How fast</h3>
      <p className="text-caption text-muted-foreground">You choose when you book.</p>
      <ol className="mt-4">
        {turnaroundOptions.map((t, i) => (
          <li key={t.label} className="flex gap-3">
            <span aria-hidden className="flex flex-col items-center">
              <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-clay ring-4 ring-clay-soft" />
              {i < turnaroundOptions.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
            </span>
            <div className="min-w-0 pb-4">
              <p className="text-body-sm font-semibold">{t.label}</p>
              <p className="text-caption text-muted-foreground">{t.note}</p>
            </div>
          </li>
        ))}
      </ol>
    </Tile>
  );
}

function PayTile({ className }: { className?: string }) {
  return (
    <Tile tone="success" className={cn("flex items-center gap-4", className)}>
      <div className="min-w-0 flex-1">
        <h3 className="display text-title">Pay when it&apos;s back</h3>
        <p className="mt-1 text-body-sm text-muted-foreground">Cash or M-Pesa. No deposit.</p>
      </div>
      <MobilePaymentsIllustration className="h-20 w-auto shrink-0" />
    </Tile>
  );
}

function HoursTile({ className }: { className?: string }) {
  return (
    <Tile className={className}>
      <h3 className="display text-title">Open daily</h3>
      <dl className="mt-3 grid gap-x-4 gap-y-2 text-body-sm @sm:grid-cols-2">
        {site.hours.map((h) => (
          <div key={h.days}>
            <dt className="text-caption text-muted-foreground">{h.days}</dt>
            <dd className="font-semibold">{h.time}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-caption text-muted-foreground">{site.hoursNote}</p>
    </Tile>
  );
}

function HelpTile() {
  return (
    <article className="min-w-0 rounded-3xl bg-gradient-forest p-5 surface-inverse sm:p-6">
      <h3 className="display text-title">Not sure what to pick?</h3>
      <p className="mt-1 text-body-sm text-muted-foreground">
        Tell us what you have and we&apos;ll suggest the right basket.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild variant="inverse" size="md" className="flex-1">
          <a href={phoneHref} aria-label={`Call ${site.phoneDisplay}`}>
            <Phone aria-hidden /> Call us
          </a>
        </Button>
        <WhatsAppButton
          message="Hi Street Mart, which laundry basket size do I need?"
          variant="outline-inverse"
          size="md"
          className="flex-1"
        >
          WhatsApp
        </WhatsAppButton>
      </div>
    </article>
  );
}

/*
 * Prices and the small print as a loose bento: two stacks that start at different heights, with
 * columns and pairs inside them that are offset again, so no two tiles line up edge to edge.
 * Phones get one column with the short tiles paired side by side; tiles size from their stack's
 * width (container queries), so the same tiles work beside or below each other.
 */
export function GoodToKnow() {
  return (
    <Section id="prices" tone="muted" className="overflow-hidden">
      <SectionHeading
        align="left"
        title="Good to know"
        intro="Every price, up front. Pickup, delivery and ironing are always free, and you pay when your laundry is back."
      />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-6">
        <div className="@container grid min-w-0 content-start gap-4 sm:gap-5 lg:gap-6">
          <BasketsTile />
          <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 @lg:grid-cols-2 @lg:gap-6">
            <div className="grid gap-4 sm:gap-5 @lg:gap-6">
              <PriceTile id="duvets" icon={BedDouble} />
              <PayTile />
            </div>
            <div className="grid grid-cols-1 items-start gap-4 sm:gap-5 @xs:grid-cols-2 @lg:mt-12 @lg:grid-cols-1 @lg:gap-6">
              <PriceTile id="mats" icon={Layers} tone="accent" />
              <PriceTile id="shoes" icon={Footprints} className="@xs:mt-8 @lg:mt-0" />
            </div>
          </div>
        </div>

        <div className="@container grid min-w-0 content-start gap-4 sm:mt-20 sm:gap-5 lg:mt-32 lg:gap-6">
          <SpeedTile />
          <HoursTile />
          <HelpTile />
          <FreeTile />
        </div>
      </div>
    </Section>
  );
}
