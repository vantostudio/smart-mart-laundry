import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, MessageCircle, Clock } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { shopHighlights } from "@/data/market";
import { site, waLink } from "@/data/site";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "Clothing Shop — Street Mart Kenya, Chuka" },
      {
        name: "description",
        content:
          "Our own clothing shop at Chuka General — everyday wear, campus trends, dresses, suits and shoes. Visit us or ask on WhatsApp.",
      },
      { property: "og:title", content: "Clothing Shop — Street Mart Kenya, Chuka" },
      {
        property: "og:description",
        content: "Everyday wear, campus trends, dresses, suits and shoes at Chuka General.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1590955256762-e60f6e08122a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop",
      },
      { name: "twitter:image", content:
          "https://images.unsplash.com/photo-1590955256762-e60f6e08122a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  return (
    <>
      <PageHero
        eyebrow="Our shop"
        title="Clothing picked for Chuka"
        intro="Our own clothing shop at Chuka General — walk in, try it on, walk out with it. Mtumba and brand new, hand-picked for quality and price."
        chips={["Mtumba & brand new", "Try before you buy", "Clothes & shoes"]}
        image={{
          src: "https://images.unsplash.com/photo-1590955256762-e60f6e08122a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
          alt: "A woman browsing colourful clothing",
        }}
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3">
          {shopHighlights.map((s, i) => (
            <article
              key={s.id}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={s.image}
                  alt={s.name}
                  loading={i > 1 ? "lazy" : undefined}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h2 className="font-display text-base font-semibold">{s.name}</h2>
                <p className="mt-1 text-xs leading-snug text-muted-foreground sm:text-sm">
                  {s.blurb}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Visit us"
              title="Come and see it in person"
              intro="We are right at Chuka General, next to the main stage. Prices are marked in shop, and our team will help you find your size."
            />
            <ul className="mt-8 space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 text-clay" />
                <span>
                  <strong className="block">{site.location.point}</strong>
                  <span className="text-muted-foreground">
                    {site.location.area}, {site.location.country}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 text-clay" />
                <span>
                  <strong className="block">Opening hours</strong>
                  <span className="text-muted-foreground">
                    {site.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}
                  </span>
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MessageCircle className="mt-0.5 size-5 text-clay" />
                <span>
                  <strong className="block">Ask what's in stock</strong>
                  <span className="text-muted-foreground">
                    Send us a WhatsApp message and we reply the same day.
                  </span>
                </span>
              </li>
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <a
                  href={waLink("Hi Street Mart, what's in stock at the shop right now?")}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ask on WhatsApp
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-foreground/20 hover:bg-secondary">
                <Link to="/egikomba" className="gap-1.5">
                  Browse E-Gikomba <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1563132337-f159f484226c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000"
            alt="Campus trendy wear from the shop"
            loading="lazy"
            className="aspect-[4/3] w-full self-center rounded-3xl object-cover shadow-lift"
          />
        </div>
      </section>
    </>
  );
}
