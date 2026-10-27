import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Shirt, Sparkles, Store } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { SectionHeading } from "@/components/section-heading";
import { promises } from "@/data/content";
import { site } from "@/data/site";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Street Mart Kenya — Laundry, Shop & E-Gikomba in Chuka" },
      {
        name: "description",
        content:
          "Street Mart Kenya is a laundry pickup and delivery service, a clothing shop and the E-Gikomba marketplace — all based at Chuka General, Tharaka Nithi County.",
      },
      { property: "og:title", content: "About Street Mart Kenya" },
      {
        property: "og:description",
        content: "Laundry, clothing shop and the E-Gikomba marketplace — all from Chuka General.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AboutPage,
});

const pillars = [
  {
    icon: Sparkles,
    title: "Laundry",
    body: "Free pickup, careful washing, free ironing and delivery back to your door — across Chuka and the wider county.",
    to: "/laundry",
  },
  {
    icon: Shirt,
    title: "Clothing shop",
    body: "Our own shop at Chuka General — mtumba and brand new clothes and shoes, hand-picked and fairly priced.",
    to: "/shop",
  },
  {
    icon: Store,
    title: "E-Gikomba",
    body: "A marketplace for local sellers — we list, market and deliver every order so sellers can focus on stock.",
    to: "/egikomba",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Three businesses, one counter"
        intro="Street Mart Kenya started at Chuka General with one idea: everyday services — clean clothes, good clothes, working marketplaces — should come to you, not the other way around."
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {pillars.map((p) => (
            <Link
              key={p.title}
              to={p.to}
              className="group rounded-3xl border border-border bg-card p-7 shadow-card transition-shadow hover:shadow-lift"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-clay-soft">
                <p.icon className="size-5 text-accent-foreground" />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Learn more <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/60 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="What we promise"
            title="Free where it counts"
            intro="Every laundry basket includes pickup, delivery and ironing at no extra cost — and you only pay when your clothes are back in your hands."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {promises.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              align="left"
              eyebrow="Where to find us"
              title="Chuka General, next to the main stage"
              intro="Right in the middle of things — stop by the shop, drop off a question, or watch the riders head out for their next pickup."
            />
          </div>
          <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/60">
                  Location
                </dt>
                <dd className="mt-1">
                  {site.location.point} — {site.location.area}, {site.location.country}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/60">
                  Opening hours
                </dt>
                <dd className="mt-1 space-y-0.5">
                  {site.hours.map((h) => (
                    <p key={h.days}>
                      {h.days}: {h.time}
                    </p>
                  ))}
                  <p className="text-xs text-primary-foreground/65">{site.hoursNote}</p>
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/60">
                  Contact
                </dt>
                <dd className="mt-1">
                  <a href={`tel:+${site.whatsapp}`} className="hover:text-clay">
                    {site.phoneDisplay}
                  </a>{" "}
                  ·{" "}
                  <a href={`mailto:${site.email}`} className="hover:text-clay">
                    {site.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
