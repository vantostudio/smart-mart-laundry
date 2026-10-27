import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bike, MessageCircle, Store } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { CategoryCard } from "@/components/category-card";
import { Button } from "@/components/ui/button";
import { egikombaCategories, ksh, sellPlans } from "@/data/market";
import { waLink } from "@/data/site";

export const Route = createFileRoute("/egikomba")({
  head: () => ({
    meta: [
      { title: "E-Gikomba Marketplace — Street Mart Kenya, Chuka" },
      {
        name: "description",
        content:
          "E-Gikomba at Chuka General: mtumba and brand new clothes and shoes for ladies, men, kids and campus — browsed on WhatsApp, delivered by Street Mart riders.",
      },
      { property: "og:title", content: "E-Gikomba Marketplace — Street Mart Kenya, Chuka" },
      {
        property: "og:description",
        content: "Mtumba and new clothes and shoes, delivered by Street Mart riders across Chuka.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1720343354398-89c6aa6d12a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop",
      },
      { name: "twitter:image", content:
          "https://images.unsplash.com/photo-1720343354398-89c6aa6d12a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: EgikombaPage,
});

const buySteps = [
  {
    icon: MessageCircle,
    title: "Browse on WhatsApp",
    body: "Each stall posts its stock with photos and prices — ask for today's catalogue.",
  },
  {
    icon: Store,
    title: "Choose your pick",
    body: "Reserve what you like. Everything is clothes and shoes only, mtumba or brand new.",
  },
  {
    icon: Bike,
    title: "We deliver",
    body: "A Street Mart rider brings your order to your gate. Pay on delivery.",
  },
];

function EgikombaPage() {
  return (
    <>
      <PageHero
        eyebrow="E-Gikomba"
        title="The marketplace at Chuka General"
        intro="Clothes and shoes only — mtumba and brand new — from trusted sellers around Chuka. Browse on WhatsApp and let Street Mart riders deliver to your door."
        chips={["Mtumba & brand new", "Clothes & shoes only", "Rider delivery"]}
        image={{
          src: "https://images.unsplash.com/photo-1720343354398-89c6aa6d12a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
          alt: "A woman in a colourful dress from an E-Gikomba stall",
        }}
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading
          eyebrow="What's in the market"
          title="Pick your aisle"
        />
        <div className="mt-10 grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
          {egikombaCategories.map((c, i) => (
            <div key={c.id} className={i === 4 ? "col-span-2 md:col-span-1" : ""}>
              <CategoryCard image={c.image} name={c.name} caption={c.caption} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="How buying works"
            title="Three steps to your gate"
          />
          <ol className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {buySteps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <span className="flex size-11 items-center justify-center rounded-full bg-clay-soft">
                  <s.icon className="size-5 text-accent-foreground" />
                </span>
                <p className="mt-3.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8 text-center">
            <Button asChild className="rounded-full px-7">
              <a
                href={waLink("Hi Street Mart, please send me today's E-Gikomba catalogue.")}
                target="_blank"
                rel="noreferrer"
              >
                Get today's catalogue
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            tone="on-dark"
            eyebrow="Sellers"
            title="Have stock to sell?"
            intro="Pick a monthly stall plan and start listing on E-Gikomba — we handle delivery for every order."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {sellPlans.map((p) => (
              <Link
                key={p.id}
                to="/sell"
                className={`flex flex-col rounded-2xl p-6 transition-colors ${
                  p.featured
                    ? "bg-clay text-white"
                    : "bg-primary-foreground/5 hover:bg-primary-foreground/10"
                }`}
              >
                <p className="font-display text-xl font-semibold">{p.name}</p>
                <p className="mt-1 font-display text-2xl font-semibold text-white/95">
                  {ksh(p.price)}
                  <span className="ml-1 font-sans text-xs font-normal text-white/70">
                    /month
                  </span>
                </p>
                <p className="mt-3 flex-1 text-sm text-white/80">{p.for}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                  See the plan <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
