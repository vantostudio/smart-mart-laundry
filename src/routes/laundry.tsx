import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { PriceGroupCard } from "@/components/price-group-card";
import { SectionHeading } from "@/components/section-heading";
import { useCart } from "@/lib/cart";
import { ksh } from "@/data/market";
import {
  dayOptions,
  laundryItems,
  priceGroups,
  timeOptions,
  turnaroundOptions,
} from "@/data/laundry";
import { site, waLink } from "@/data/site";

export const Route = createFileRoute("/laundry")({
  head: () => ({
    meta: [
      { title: "Laundry & Prices — Street Mart Kenya" },
      {
        name: "description",
        content:
          "Laundry prices in Chuka: baskets from KSh 150, duvets, mats and shoes. Free pickup, delivery and ironing — pay on delivery, cash or M-Pesa.",
      },
      { property: "og:title", content: "Laundry & Prices — Street Mart Kenya" },
      {
        property: "og:description",
        content:
          "Free pickup, delivery and ironing across Chuka. Clear prices — pay on delivery.",
      },
      {
        property: "og:image",
        content:
          "https://images.unsplash.com/photo-1758279744970-b32360a5e907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop",
      },
      { name: "twitter:image", content:
          "https://images.unsplash.com/photo-1758279744970-b32360a5e907?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200&h=630&fit=crop" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LaundryPage,
});

const fieldClass =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-shadow focus:border-clay focus:ring-2 focus:ring-clay/30";

function CartPanel() {
  const { items, total, setQty, remove, clear } = useCart();
  const [location, setLocation] = useState("");
  const [pickupDay, setPickupDay] = useState<string>(dayOptions[0]);
  const [pickupTime, setPickupTime] = useState<string>(timeOptions[1]);
  const [returnDay, setReturnDay] = useState<string>(dayOptions[1]);
  const [returnTime, setReturnTime] = useState<string>(timeOptions[6]);

  const message = () =>
    [
      "Hi Street Mart! I'd like to book a laundry pickup.",
      "",
      "Order:",
      ...items.map((i) => `• ${i.qty} × ${i.name} — ${ksh(i.price * i.qty)}`),
      `Total: ${ksh(total)}`,
      "",
      `Pickup: ${location || "(location)"}, ${pickupDay} at ${pickupTime}`,
      `Return by: ${returnDay} at ${returnTime}`,
      "",
      "Payment on delivery (cash or M-Pesa).",
    ].join("\n");

  return (
    <aside
      id="cart"
      className="lg:sticky lg:top-24 lg:self-start"
      aria-label="Laundry cart"
    >
      <div className="rounded-3xl bg-primary p-6 text-primary-foreground shadow-lift">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Your pickup</h2>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-xs text-primary-foreground/70 hover:text-clay"
            >
              <Trash2 className="size-3.5" /> Clear
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-4 text-sm text-primary-foreground/75">
            Your cart is empty — add baskets, duvets, mats or shoes from the list
            below and they will show up here.
          </p>
        ) : (
          <>
            <ul className="mt-4 space-y-3">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 border-b border-primary-foreground/15 pb-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{i.name}</p>
                    <p className="text-xs text-clay">{ksh(i.price * i.qty)}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-primary-foreground/25 px-1 py-0.5">
                    <button
                      type="button"
                      aria-label={`Remove one ${i.name}`}
                      onClick={() => setQty(i.id, i.qty - 1)}
                      className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/10"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="min-w-5 text-center text-sm font-semibold">{i.qty}</span>
                    <button
                      type="button"
                      aria-label={`Add one ${i.name}`}
                      onClick={() => setQty(i.id, i.qty + 1)}
                      className="flex size-6 items-center justify-center rounded-full transition-colors hover:bg-primary-foreground/10"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${i.name} entirely`}
                    onClick={() => remove(i.id)}
                    className="text-primary-foreground/50 transition-colors hover:text-clay"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t-2 border-primary-foreground/20 pt-3">
              <span className="text-sm text-primary-foreground/80">Estimated total</span>
              <span className="font-display text-2xl font-semibold text-clay">
                {ksh(total)}
              </span>
            </div>
          </>
        )}

        <div className="mt-6 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/5 p-4">
          <p className="text-sm font-semibold">Collection &amp; return details</p>
          <p className="mt-1 text-xs leading-snug text-primary-foreground/70">
            Where should we collect, and when do you need everything back?
          </p>
          <div className="mt-3 grid gap-2.5">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Collection location — e.g. Chuka town, near the university"
              className="w-full rounded-xl border border-primary-foreground/30 bg-background/95 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-clay"
            />
            <div className="grid grid-cols-2 gap-2.5">
              <select value={pickupDay} onChange={(e) => setPickupDay(e.target.value)} className={fieldClass} aria-label="Day of collection">
                {dayOptions.map((d) => <option key={d} value={d}>Pickup: {d}</option>)}
              </select>
              <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={fieldClass} aria-label="Time of collection">
                {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={returnDay} onChange={(e) => setReturnDay(e.target.value)} className={fieldClass} aria-label="Day of return">
                {dayOptions.map((d) => <option key={d} value={d}>Return: {d}</option>)}
              </select>
              <select value={returnTime} onChange={(e) => setReturnTime(e.target.value)} className={fieldClass} aria-label="Time of return">
                {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <a
            href={waLink(message())}
            target="_blank"
            rel="noreferrer"
            className="mt-5 flex w-full items-center justify-center rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Checkout on WhatsApp
          </a>
        ) : (
          <span className="mt-5 flex w-full cursor-not-allowed items-center justify-center rounded-full bg-clay/50 px-6 py-3 text-sm font-semibold text-white/70">
            Checkout on WhatsApp
          </span>
        )}
        <p className="mt-3 text-center text-xs leading-snug text-primary-foreground/70">
          Pay on delivery — cash or M-Pesa when your clothes come back. Pickup,
          delivery and ironing are always free.
        </p>
      </div>
    </aside>
  );
}

function LaundryPage() {
  return (
    <>
      <PageHero
        eyebrow="Laundry"
        title="Collected, cleaned, returned — on time"
        intro="Tell us what needs cleaning and when you need it back. We work backwards from your deadline — same day, next day or standard."
        chips={["Free pickup & delivery", "Free ironing", "Pay on delivery"]}
        image={{
          src: "https://images.unsplash.com/photo-1664227431098-1289c13695c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1000",
          alt: "Neatly folded laundry and towels stacked",
        }}
      />

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-4">
              {laundryItems.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <CartPanel />
        </div>
      </section>

      <section id="prices" className="bg-secondary/60 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Price list"
            title="Every price, up front"
            intro="Ironing, pickup and delivery are always free — the price you see is the price you pay on delivery."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {priceGroups.map((g) => (
              <PriceGroupCard key={g.id} group={g} />
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {turnaroundOptions.map((t, i) => (
              <div
                key={t}
                className="rounded-2xl border border-border bg-card p-5 text-center shadow-card"
              >
                <p className="font-display text-lg font-semibold">{t}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {["Back by evening, same day", "Back by the next evening", "Back within two days"][i]}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-md text-center text-sm text-muted-foreground">
            Not sure which basket you need?{" "}
            <a href={`tel:+${site.whatsapp}`} className="font-semibold text-primary underline underline-offset-4">
              Call {site.phoneDisplay}
            </a>{" "}
            or <Link to="/contact" className="font-semibold text-primary underline underline-offset-4">send a message</Link>.
          </p>
        </div>
      </section>
    </>
  );
}
