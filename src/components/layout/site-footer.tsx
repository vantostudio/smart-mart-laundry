import Link from "next/link";

import { Container } from "@/components/shared/section";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Wordmark } from "@/components/shared/wordmark";
import { footerNav } from "@/config/navigation";
import { site } from "@/config/site";

// Evaluated once per server start / build, so the footer stays fully static.
const copyrightYear = new Date().getFullYear();

const columnTitle = "overline text-muted-foreground";
const footerLink = "transition-colors hover:text-clay";

export function SiteFooter() {
  return (
    <footer className="bg-mesh surface-inverse">
      <Container className="grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-body-sm text-muted-foreground">
            Laundry pickup and delivery, our own clothing shop and the E-Gikomba marketplace — all
            from {site.location.point}, {site.location.area}.
          </p>
          <WhatsAppButton variant="gradient-clay" size="sm" className="mt-6">
            Chat on WhatsApp
          </WhatsAppButton>
        </div>

        <nav aria-label="Footer">
          <p className={columnTitle}>Explore</p>
          <ul className="mt-5 space-y-3 text-body-sm">
            {footerNav.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={footerLink}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className={columnTitle}>Find us</p>
          <ul className="mt-5 space-y-3 text-body-sm">
            <li>{site.location.point}</li>
            <li>
              {site.location.area}, {site.location.country}
            </li>
            <li>
              <a href={`tel:+${site.whatsapp}`} className={footerLink}>
                {site.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={footerLink}>
                {site.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className={columnTitle}>Opening hours</p>
          <ul className="mt-5 space-y-3 text-body-sm">
            {site.hours.map((h) => (
              <li key={h.days}>
                <span className="block font-semibold">{h.days}</span>
                <span className="text-muted-foreground">{h.time}</span>
              </li>
            ))}
            <li className="text-caption text-muted-foreground">{site.hoursNote}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border py-5">
        <Container>
          <p className="text-center text-caption text-muted-foreground">
            © {copyrightYear} {site.name} · Chuka, Tharaka Nithi County · Payment on delivery
          </p>
        </Container>
      </div>
    </footer>
  );
}
