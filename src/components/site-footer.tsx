import { Link } from "@tanstack/react-router";
import { site, waLink } from "@/data/site";
import { WHATSAPP_ORDER_DEFAULT } from "@/data/site";

const explore = [
  { to: "/laundry", label: "Laundry & prices" },
  { to: "/shop", label: "Clothing shop" },
  { to: "/egikomba", label: "E-Gikomba marketplace" },
  { to: "/sell", label: "Sell with us" },
  { to: "/track", label: "Track your order" },
  { to: "/about", label: "About us" },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl font-semibold">Street Mart Kenya</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-primary-foreground/75">
            Laundry pickup and delivery, our own clothing shop and the E-Gikomba
            marketplace — all from {site.location.point}, {site.location.area}.
          </p>
          <a
            href={waLink(WHATSAPP_ORDER_DEFAULT)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-clay px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Chat on WhatsApp
          </a>
        </div>

        <nav aria-label="Footer">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/60">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {explore.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-primary-foreground/85 hover:text-clay">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/60">
            Find us
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/85">
            <li>{site.location.point}</li>
            <li>{site.location.area}, {site.location.country}</li>
            <li>
              <a href={`tel:+${site.whatsapp}`} className="hover:text-clay">
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-clay">
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground/60">
            Opening hours
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-primary-foreground/85">
            {site.hours.map((h) => (
              <li key={h.days}>
                <span className="block font-semibold text-primary-foreground">{h.days}</span>
                {h.time}
              </li>
            ))}
            <li className="text-xs text-primary-foreground/65">{site.hoursNote}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 py-5">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-primary-foreground/60 sm:px-6">
          © {new Date().getFullYear()} Street Mart Kenya · Chuka, Tharaka Nithi County ·
          Payment on delivery
        </p>
      </div>
    </footer>
  );
}
