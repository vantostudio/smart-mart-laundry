"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/shared/section";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/navigation";
import { site } from "@/config/site";
import { CartLink } from "@/features/cart/components/cart-link";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  // Remember which path the menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  return (
    <header className="sticky top-0 z-(--z-header) border-b border-border/70 bg-background/80 backdrop-blur-xl backdrop-saturate-150">
      <Container className="flex h-header items-center justify-between gap-4">
        <Wordmark />

        <nav
          className="hidden items-center gap-1 rounded-full border border-border/70 bg-card/60 p-1 lg:flex"
          aria-label="Main"
        >
          {mainNav.map((l) => {
            const current = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "rounded-full px-4 py-1.5 text-body-sm font-medium transition-colors duration-200",
                  current
                    ? "bg-primary text-primary-foreground inset-shadow-highlight"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <CartLink />
          <Button asChild variant="gradient-clay" size="sm" className="hidden sm:inline-flex">
            <Link href="/laundry">Order pickup</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpenOn(open ? null : pathname)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </Container>

      {open && (
        <nav
          id="mobile-nav"
          className="animate-fade-in border-t border-border bg-background/95 pb-6 backdrop-blur-xl lg:hidden"
          aria-label="Mobile"
        >
          <Container>
            <ul className="flex flex-col py-2">
              {mainNav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={pathname === l.href ? "page" : undefined}
                    className="group flex items-center justify-between border-b border-border/70 py-4 font-display text-title font-semibold text-foreground aria-[current=page]:text-clay"
                  >
                    {l.label}
                    <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
            <Button asChild variant="gradient-clay" size="lg" block className="mt-5">
              <Link href="/laundry">Order pickup</Link>
            </Button>
            <p className="mt-4 text-center text-caption text-muted-foreground">
              {site.location.point} · {site.location.area}
            </p>
          </Container>
        </nav>
      )}
    </header>
  );
}
