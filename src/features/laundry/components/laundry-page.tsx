import { Card } from "@/components/shared/card";
import { PageHero } from "@/components/shared/page-hero";
import { Section } from "@/components/shared/section";
import { SectionHeading } from "@/components/shared/section-heading";
import { site } from "@/config/site";
import { laundryItems, priceGroups, turnaroundOptions } from "@/features/laundry/data";
import { unsplash } from "@/lib/images";
import { waLink } from "@/lib/whatsapp";

import { CartPanel } from "./cart-panel";
import { LaundryItemCard } from "./laundry-item-card";
import { PriceGroupCard } from "./price-group-card";

export function LaundryPage() {
  return (
    <>
      <PageHero
        eyebrow="Laundry"
        title="Collected, cleaned, returned — on time"
        intro="Tell us what needs cleaning and when you need it back. We work backwards from your deadline — same day, next day or standard."
        chips={["Free pickup & delivery", "Free ironing", "Pay on delivery"]}
        image={{
          src: unsplash("photo-1664227431098-1289c13695c1", 1000),
          alt: "Neatly folded laundry and towels stacked",
        }}
      />

      <Section spacing="bottom">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {laundryItems.map((item, i) => (
              <LaundryItemCard key={item.id} item={item} priority={i < 2} />
            ))}
          </div>
          <CartPanel />
        </div>
      </Section>

      <Section id="prices" tone="muted">
        <SectionHeading
          eyebrow="Price list"
          title="Every price, up front"
          intro="Ironing, pickup and delivery are always free — the price you see is the price you pay on delivery."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {priceGroups.map((g) => (
            <PriceGroupCard key={g.id} group={g} />
          ))}
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {turnaroundOptions.map((t, i) => (
            <Card
              key={t.label}
              variant={i === 0 ? "clay" : "default"}
              className="items-center text-center"
            >
              <p className="font-display text-title font-semibold">{t.label}</p>
              <p className="mt-1 text-caption text-muted-foreground">{t.note}</p>
            </Card>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-md text-center text-body-sm text-muted-foreground">
          Not sure which basket you need?{" "}
          <a href={`tel:+${site.whatsapp}`} className="text-link">
            Call {site.phoneDisplay}
          </a>{" "}
          or{" "}
          <a
            href={waLink("Hi Street Mart, which laundry basket size do I need?")}
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            ask us on WhatsApp
          </a>
          .
        </p>
      </Section>
    </>
  );
}
