import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { PageHero } from "@/components/page-hero";
import { site, waLink } from "@/data/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Booking — Street Mart Kenya, Chuka" },
      {
        name: "description",
        content:
          "Call, WhatsApp or send a booking enquiry — Street Mart Kenya at Chuka General, Tharaka Nithi County. We reply the same day.",
      },
      { property: "og:title", content: "Contact & Booking — Street Mart Kenya" },
      {
        property: "og:description",
        content: "Call, WhatsApp or send a message — we reply the same day.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ContactPage,
});

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none transition-shadow focus:border-clay focus:ring-2 focus:ring-clay/30";

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const enquiry = () =>
    waLink(
      `Hi Street Mart! Booking enquiry.\nName: ${name || "(name)"}\nEmail: ${email || "(email)"}\n\n${message || "(message)"}`,
    );

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to us today"
        intro="Based at Chuka General. Call, WhatsApp or send a message and we reply the same day — usually within the hour during opening times."
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-clay-soft">
                  <Phone className="size-5 text-accent-foreground" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Call or WhatsApp
                  </p>
                  <a
                    href={`tel:+${site.whatsapp}`}
                    className="mt-0.5 block text-sm font-semibold hover:text-primary"
                  >
                    {site.phoneDisplay}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-clay-soft">
                  <Mail className="size-5 text-accent-foreground" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Email
                  </p>
                  <a
                    href={`mailto:${site.email}`}
                    className="mt-0.5 block text-sm font-semibold hover:text-primary"
                  >
                    {site.email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-clay-soft">
                  <MapPin className="size-5 text-accent-foreground" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Location
                  </p>
                  <p className="mt-0.5 text-sm font-semibold">
                    {site.location.point}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {site.location.area}, {site.location.country}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-clay-soft">
                  <Clock className="size-5 text-accent-foreground" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                    Opening hours
                  </p>
                  {site.hours.map((h) => (
                    <p key={h.days} className="mt-0.5 text-sm">
                      <span className="font-semibold">{h.days}:</span>{" "}
                      <span className="text-muted-foreground">{h.time}</span>
                    </p>
                  ))}
                  <p className="mt-1 text-xs text-muted-foreground">{site.hoursNote}</p>
                </div>
              </li>
            </ul>

            <a
              href={waLink("Hi Street Mart, I'd like to book a laundry pickup.")}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-clay px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <MessageCircle className="size-4" /> Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-card sm:p-9">
            <h2 className="font-display text-2xl font-semibold">Send a booking enquiry</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tell us what needs cleaning, where you are and when you need it back.
              Your message opens in WhatsApp — we confirm your rider from there.
            </p>
            <form
              className="mt-6 grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                window.open(enquiry(), "_blank", "noreferrer");
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm font-semibold">
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={`${inputClass} font-normal`}
                  />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputClass} font-normal`}
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-sm font-semibold">
                Message
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Two duvets and a basket, near Chuka University, back by Friday"
                  rows={5}
                  className={`${inputClass} resize-y font-normal`}
                />
              </label>
              <button
                type="submit"
                className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto"
              >
                Send via WhatsApp
              </button>
              <p className="text-xs text-muted-foreground">
                Prefer talking? Call {site.phoneDisplay} — payment on delivery, no
                deposit needed.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
