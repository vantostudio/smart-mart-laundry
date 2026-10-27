import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Bike, ListPlus, Smartphone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import { ksh, sellPlans } from "@/data/market";
import { waLink } from "@/data/site";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell on E-Gikomba — Street Mart Kenya" },
      {
        name: "description",
        content:
          "Sell your clothes and shoes on E-Gikomba from KSh 1,000 a month. We list, market and deliver every order — the stall goes live once your M-Pesa payment is recorded.",
      },
      { property: "og:title", content: "Sell on E-Gikomba — Street Mart Kenya" },
      {
        property: "og:description",
        content:
          "Monthly stall plans from KSh 1,000. Street Mart lists, markets and delivers your orders.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1586232902955-df204f34b36e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop",
      },
      { name: "twitter:image", content:
          "https://images.unsplash.com/photo-1586232902955-df204f34b36e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: SellPage,
});

const sellSteps = [
  {
    icon: Smartphone,
    title: "Pay for your stall",
    body: "Choose a plan and pay monthly by M-Pesa. Your stall goes live once the payment is recorded.",
  },
  {
    icon: ListPlus,
    title: "List your stock",
    body: "Send us photos and prices — we list your mtumba or brand new clothes and shoes on the market.",
  },
  {
    icon: Bike,
    title: "We deliver every order",
    body: "When a customer buys, a Street Mart rider delivers to their gate and brings you the sale.",
  },
  {
    icon: BadgeCheck,
    title: "Grow your stall",
    body: "Higher plans get featured badges, better placement and a monthly homepage feature.",
  },
];

function SellPage() {
  return (
    <>
      <PageHero
        eyebrow="Sell with us"
        title="Your stall on E-Gikomba"
        intro="Pick a monthly plan and start listing your clothes and shoes. Your stall goes live once your M-Pesa payment is recorded — and Street Mart riders deliver every order for you."
        chips={["Mtumba or brand new", "M-Pesa monthly", "We deliver your orders"]}
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {sellPlans.map((p) => (
            <article
              key={p.id}
              className={`relative flex flex-col rounded-3xl p-7 shadow-card ${
                p.featured
                  ? "bg-primary text-primary-foreground shadow-lift"
                  : "border border-border bg-card"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-clay px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
                  Most popular
                </span>
              )}
              <h2 className="font-display text-2xl font-semibold">{p.name}</h2>
              <p className={`mt-1 text-sm ${p.featured ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                {p.for}
              </p>
              <p className={`mt-5 font-display text-4xl font-semibold ${p.featured ? "text-white" : "text-primary"}`}>
                {ksh(p.price)}
                <span className={`ml-1.5 align-baseline font-sans text-sm font-normal ${p.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  / month
                </span>
              </p>
              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <BadgeCheck
                      className={`mt-0.5 size-4 shrink-0 ${p.featured ? "text-clay" : "text-primary"}`}
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-7 rounded-full ${
                  p.featured ? "bg-clay text-white hover:bg-clay/90" : ""
                }`}
                variant={p.featured ? "default" : "outline"}
              >
                <a
                  href={waLink(`Hi Street Mart, I'd like the ${p.name} seller plan (${ksh(p.price)}/month).`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Choose {p.name}
                </a>
              </Button>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          All plans renew monthly by M-Pesa. Prices shown per month in Kenyan shillings.
        </p>
      </section>

      <section className="bg-secondary/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="How selling works"
            title="From M-Pesa to doorstep"
          />
          <ol className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {sellSteps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-full bg-clay-soft">
                    <s.icon className="size-5 text-accent-foreground" />
                  </span>
                  <span className="font-display text-2xl font-semibold text-clay/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-3.5 font-display text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
