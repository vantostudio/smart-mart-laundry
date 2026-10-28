import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, PackageSearch } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import { sampleTickets, trackStages, type TicketStatus } from "@/data/content";
import { site, waLink } from "@/data/site";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track Your Laundry — Street Mart Kenya" },
      {
        name: "description",
        content:
          "Enter your ticket number to see where your laundry is — booked, collected, washing, out for delivery or delivered.",
      },
      { property: "og:title", content: "Track Your Laundry — Street Mart Kenya" },
      {
        property: "og:description",
        content: "Follow your laundry from pickup to delivery with your Street Mart ticket number.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: TrackPage,
});

const inputClass =
  "w-full rounded-full border border-input bg-card px-5 py-3 text-sm outline-none transition-shadow focus:border-clay focus:ring-2 focus:ring-clay/30";

function StatusTimeline({ ticket }: { ticket: TicketStatus }) {
  return (
    <div className="mt-8 animate-fade-up rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="eyebrow">Ticket {ticket.ticket}</p>
          <h2 className="display mt-1 text-2xl">{ticket.status}</h2>
        </div>
        <p className="font-display text-2xl font-semibold text-primary">{ticket.total}</p>
      </div>

      <ol className="mt-7 space-y-0">
        {trackStages.map((stage, i) => {
          const done = i <= ticket.stage;
          const current = i === ticket.stage;
          return (
            <li key={stage} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs ${
                    done ? "bg-primary text-primary-foreground" : "border border-border bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                {i < trackStages.length - 1 && (
                  <span
                    className={`my-0.5 w-px flex-1 ${done ? "bg-primary" : "bg-border"}`}
                    aria-hidden
                  />
                )}
              </div>
              <div className="pb-5">
                <p className={`text-sm font-semibold ${current ? "text-clay" : ""}`}>{stage}</p>
                {current && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{ticket.statusNote}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <dl className="grid gap-x-6 gap-y-2 border-t border-dashed border-border pt-5 text-sm sm:grid-cols-2">
        {[
          ["Service", ticket.service],
          ["Items", ticket.items],
          ["Pickup", ticket.pickup],
          ["Return by", ticket.returnBy],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TrackPage() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<TicketStatus | null | "none">(null);

  const lookup = () => {
    const key = value.trim().toUpperCase();
    if (!key) return;
    const found = sampleTickets[key];
    setResult(found ?? "none");
  };

  return (
    <>
      <PageHero
        eyebrow="Track"
        title="Where is my laundry?"
        intro="Every order gets a ticket number when your clothes are collected. Enter it below to see exactly where things stand."
      />

      <section className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="Ticket number, e.g. SM-48217"
            aria-label="Ticket number"
            className={inputClass}
          />
          <button
            type="button"
            onClick={lookup}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <PackageSearch className="size-4" /> Track
          </button>
        </div>

        {result === "none" && (
          <p className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground shadow-card">
            We couldn't find that ticket number. Check your collection receipt or{" "}
            <a
              href={waLink(`Hi Street Mart, help me track ticket ${value || "(number)"}`)}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-primary underline underline-offset-4"
            >
              ask us on WhatsApp
            </a>
            .
          </p>
        )}
        {result && result !== "none" && <StatusTimeline ticket={result} />}

        <div className="mt-8 rounded-2xl bg-secondary/70 p-5 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Try a demo ticket</p>
          <p className="mt-1">
            This page is a live demo — sample tickets{" "}
            {Object.keys(sampleTickets).map((k, i) => (
              <span key={k}>
                {i > 0 && ", "}
                <button
                  type="button"
                  onClick={() => {
                    setValue(k);
                    setResult(sampleTickets[k] ?? null);
                  }}
                  className="font-semibold text-primary underline underline-offset-4"
                >
                  {k}
                </button>
              </span>
            ))}
            . Real tracking comes with online accounts — until then, every order is
            confirmed and updated by WhatsApp on {site.phoneDisplay}.
          </p>
          <p className="mt-2">
            Ready to book?{" "}
            <Link to="/laundry" className="font-semibold text-primary underline underline-offset-4">
              Order a pickup
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
