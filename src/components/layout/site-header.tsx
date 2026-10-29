"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/shared/section";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/config/navigation";
import { CartLink } from "@/features/cart/components/cart-link";

/** Wordmark, the two main links (always visible, no menu), cart when it has items, and on lg a booking button. */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-(--z-header) border-b border-border/70 bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <Container className="flex h-14 items-center gap-2 xs:gap-3 lg:h-header">
        <Wordmark className="shrink-0" />

        <nav aria-label="Main" className="xs:ml-1 sm:ml-4">
          <ul className="flex items-center">
            {mainNav.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={pathname === l.href ? "page" : undefined}
                  className="inline-flex h-11 items-center px-2 text-body font-medium text-muted-foreground decoration-clay decoration-2 underline-offset-8 transition-colors hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:underline xs:px-2.5"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <CartLink />
          <Button asChild variant="gradient-clay" size="md" className="hidden lg:inline-flex">
            <Link href="/laundry">Book pickup</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
