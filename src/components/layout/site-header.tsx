"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Container } from "@/components/shared/section";
import { Wordmark } from "@/components/shared/wordmark";
import { Button } from "@/components/ui/button";
import { siteNav } from "@/config/navigation";
import { CartLink } from "@/features/cart/components/cart-link";
import { cn } from "@/lib/utils";

import { SiteMenu } from "./site-menu";

/**
 * Phones and tablets: menu button, the logo centred, the orders button. Desktop: logo, every page
 * as a segmented pill, orders and Book pickup.
 */
export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-(--z-header) border-b border-border/70 bg-background/85 backdrop-blur-xl backdrop-saturate-150">
      <Container className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 lg:flex lg:h-header lg:gap-3">
        <SiteMenu className="-ml-2.5 justify-self-start lg:hidden" />

        <Wordmark className="justify-self-center" />

        {/* Segmented pill: the current page sits on a raised white chip. Each link is the full
            44px tall to tap; the chip is drawn 4px inside it. */}
        <nav aria-label="Main" className="hidden lg:ml-4 lg:block">
          <ul className="flex items-center rounded-full bg-secondary/80 ring-1 ring-border/60">
            {siteNav.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={pathname === href ? "page" : undefined}
                  className={cn(
                    "group relative isolate inline-flex h-11 items-center gap-1.5 px-4 text-body-sm font-semibold text-muted-foreground transition-colors hover:text-foreground",
                    "before:absolute before:inset-1 before:-z-10 before:rounded-full before:transition-[background-color,box-shadow] before:duration-300 before:ease-out-expo hover:before:bg-card/60",
                    "aria-[current=page]:text-foreground aria-[current=page]:before:bg-card aria-[current=page]:before:shadow-card",
                  )}
                >
                  <Icon
                    aria-hidden
                    className="size-4 text-muted-foreground transition-colors group-aria-[current=page]:text-clay"
                  />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 justify-self-end lg:ml-auto">
          <CartLink />
          <Button asChild variant="gradient-clay" size="md" className="hidden lg:inline-flex">
            <Link href="/laundry">Book pickup</Link>
          </Button>
        </div>
      </Container>
    </header>
  );
}
