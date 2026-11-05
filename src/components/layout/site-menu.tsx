"use client";

import { ChevronRight, MapPin, Menu, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HoursSummary, PhoneLink, WhatsAppLink } from "@/components/shared/contact";
import { siteNav } from "@/config/navigation";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

import { OpenNow } from "./open-now";

const contactClass = "h-auto min-h-16 flex-col gap-1 rounded-2xl px-2 py-2.5 text-body-sm";

/**
 * Phone and tablet menu: a button that opens a sheet with every page (icon, title, one line),
 * Book a pickup, call / WhatsApp / directions, and whether we're open now. Closes on navigation.
 */
export function SiteMenu({ className }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className={cn("size-11 p-0", className)}
      >
        <Menu aria-hidden className="size-6" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Laundry pickup and clothes in Chuka.</SheetDescription>
          </SheetHeader>

          <SheetBody className="pb-5">
            <nav aria-label="Menu">
              <ul className="grid gap-2">
                {siteNav.map(({ href, title, blurb, icon: Icon }) => {
                  const current = pathname === href;
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                          "group flex min-h-16 items-center gap-3 rounded-2xl p-3 transition-[background-color,box-shadow]",
                          current
                            ? "bg-card shadow-card ring-1 ring-primary/15"
                            : "hover:bg-card hover:shadow-card",
                        )}
                      >
                        <span
                          className={cn(
                            "flex size-11 shrink-0 items-center justify-center rounded-xl",
                            current
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-primary",
                          )}
                        >
                          <Icon aria-hidden className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-body font-semibold">{title}</span>
                          <span className="block text-caption text-muted-foreground">{blurb}</span>
                        </span>
                        <ChevronRight
                          aria-hidden
                          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <Button asChild variant="secondary" className={contactClass}>
                <PhoneLink>
                  <Phone aria-hidden className="size-5 text-clay" />
                  Call
                </PhoneLink>
              </Button>
              <Button asChild variant="secondary" className={contactClass}>
                <WhatsAppLink aria-label="Chat on WhatsApp">
                  <MessageCircle aria-hidden className="size-5 text-clay" />
                  WhatsApp
                </WhatsAppLink>
              </Button>
              <Button asChild variant="secondary" className={contactClass}>
                <a href={site.mapsUrl} target="_blank" rel="noreferrer">
                  <MapPin aria-hidden className="size-5 text-clay" />
                  Directions
                </a>
              </Button>
            </div>

            <div className="mt-5 rounded-2xl bg-secondary/70 p-3.5">
              <OpenNow />
              <p className="text-caption text-muted-foreground">
                <HoursSummary />
              </p>
              <p className="mt-0.5 text-caption text-muted-foreground">{site.location.point}</p>
            </div>
          </SheetBody>

          <SheetFooter>
            <Button asChild variant="gradient-clay" size="lg" block>
              <Link href="/laundry" onClick={close}>
                Book a pickup
              </Link>
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
