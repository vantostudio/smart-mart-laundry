import { ChevronRight, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { HoursSummary, PhoneLink, PhoneNumber, WhatsAppLink } from "@/components/shared/contact";
import { Container } from "@/components/shared/section";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import { siteNav } from "@/config/navigation";
import { areasText, site } from "@/config/site";

import { SITE_FOOTER_ID } from "./action-bar-visibility";
import { OpenNow } from "./open-now";

// Evaluated once per server start / build, so the footer stays fully static.
const copyrightYear = new Date().getFullYear();

// Tall tile: icon above a short label.
const actionClass = "h-auto min-h-16 flex-col gap-1 rounded-2xl px-2 py-2.5 text-body-sm";

function FooterActions() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button asChild variant="outline-inverse" className={actionClass}>
        <PhoneLink>
          <Phone aria-hidden className="size-5" />
          Call
        </PhoneLink>
      </Button>
      <Button asChild variant="gradient-clay" className={actionClass}>
        <WhatsAppLink aria-label="Chat on WhatsApp">
          <MessageCircle aria-hidden className="size-5" />
          WhatsApp
        </WhatsAppLink>
      </Button>
      <Button asChild variant="outline-inverse" className={actionClass}>
        <a href={site.mapsUrl} target="_blank" rel="noreferrer">
          <MapPin aria-hidden className="size-5" />
          Directions
        </a>
      </Button>
    </div>
  );
}

/*
 * DOM order is the phone order (open now → actions → address → links). On lg the blocks are
 * placed into three columns: brand + actions | links | address + open now.
 */
export function SiteFooter() {
  return (
    <footer
      id={SITE_FOOTER_ID}
      // The phone action bar hides while the footer is on screen, so only the notch area needs room.
      className="bg-mesh pb-[env(safe-area-inset-bottom)] surface-inverse"
    >
      <Container className="grid gap-7 py-10 lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-x-12 lg:gap-y-6 lg:py-16">
        <div className="hidden lg:col-start-1 lg:row-start-1 lg:block">
          <Wordmark />
          <p className="mt-3 text-body-sm text-muted-foreground">
            Laundry pickup and delivery, plus mtumba and new clothes and shoes, in Chuka.
          </p>
        </div>

        <OpenNow className="lg:col-start-3 lg:row-start-2" />

        <div className="lg:col-start-1 lg:row-start-2 lg:max-w-sm">
          <FooterActions />
        </div>

        <div className="text-body-sm lg:col-start-3 lg:row-start-1">
          <p>
            {site.location.point}, {site.location.town}
          </p>
          <p className="text-muted-foreground">
            <HoursSummary />
          </p>
          <p className="mt-2 text-muted-foreground">Pickup and delivery: {areasText}</p>
        </div>

        <nav aria-label="Footer" className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ul className="border-t border-border">
            {siteNav.map((l) => (
              <li key={l.href} className="border-b border-border">
                <Link
                  href={l.href}
                  className="group flex min-h-11 items-center justify-between gap-4 text-body font-medium transition-colors hover:text-clay"
                >
                  {l.title}
                  <ChevronRight
                    aria-hidden
                    className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <div className="border-t border-border py-4">
        <Container className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-caption text-muted-foreground">
          <p>
            © {copyrightYear} {site.name} ·{" "}
            {/* For staff; the admin checks access itself and is noindex. */}
            <Link
              href="/admin"
              prefetch={false}
              rel="nofollow"
              className="transition-colors hover:text-clay"
            >
              Staff sign in
            </Link>
          </p>
          <p>
            Pay on delivery ·{" "}
            <PhoneLink showsNumber className="font-mono transition-colors hover:text-clay">
              <PhoneNumber />
            </PhoneLink>
          </p>
        </Container>
      </div>
    </footer>
  );
}
