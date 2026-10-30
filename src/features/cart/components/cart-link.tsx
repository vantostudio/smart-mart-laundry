"use client";

import { ChevronRight, ShoppingBag, WashingMachine, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent } from "react";

import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBag, useCart } from "@/features/cart/cart-provider";
import { cartHash, openCart, type CartKind } from "@/features/cart/open-cart";

const items = (n: number) => `${n} ${n === 1 ? "item" : "items"}`;

/** The header's round icon button with a count badge. */
function CountIcon({ icon: Icon, count }: { icon: LucideIcon; count: number }) {
  return (
    <>
      <Icon aria-hidden className="size-5" />
      <Badge
        variant="gradient"
        size="sm"
        className="absolute top-0 right-0 size-5 justify-center p-0 figures"
      >
        {count}
      </Badge>
    </>
  );
}

/**
 * One header button for both carts, so the header fits small phones. With one cart in use it
 * goes straight there (the laundry order, or the shop bag); with both it opens "Your orders" to
 * pick one. Hidden while both are empty, which includes the server render and first client render
 * (carts load after hydration), so there's no mismatch.
 */
export function CartLink() {
  const laundry = useCart();
  const bag = useBag();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // On the cart's own page its sheet opens in place; elsewhere the link's hash opens it on arrival.
  const go = (kind: CartKind) => (event: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (pathname !== (kind === "bag" ? "/shop" : "/laundry")) return;
    event.preventDefault();
    openCart(kind);
  };

  if (laundry.count === 0 && bag.count === 0) return null;

  if (bag.count === 0 || laundry.count === 0) {
    const isBag = laundry.count === 0;
    const count = isBag ? bag.count : laundry.count;
    return (
      <Button asChild variant="ghost" className="size-11 p-0">
        <Link
          href={isBag ? `/shop${cartHash.bag}` : `/laundry${cartHash.laundry}`}
          onClick={go(isBag ? "bag" : "laundry")}
          aria-label={`${isBag ? "Shop bag" : "Laundry cart"}, ${items(count)}`}
        >
          <CountIcon icon={isBag ? ShoppingBag : WashingMachine} count={count} />
        </Link>
      </Button>
    );
  }

  const count = laundry.count + bag.count;
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={`Your orders, ${items(count)}`}
        className="size-11 p-0"
      >
        <CountIcon icon={ShoppingBag} count={count} />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Your orders</SheetTitle>
            <SheetDescription>
              Laundry and shop are sent as separate WhatsApp orders.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <ul className="grid gap-2">
              <OrderRow
                href={`/laundry${cartHash.laundry}`}
                onClick={go("laundry")}
                icon={WashingMachine}
                title="Laundry pickup"
                count={laundry.count}
                total={laundry.total}
              />
              <OrderRow
                href={`/shop${cartHash.bag}`}
                onClick={go("bag")}
                icon={ShoppingBag}
                title="Shop bag"
                count={bag.count}
                total={bag.total}
              />
            </ul>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  );
}

function OrderRow({
  href,
  onClick,
  icon: Icon,
  title,
  count,
  total,
}: {
  href: `/laundry${typeof cartHash.laundry}` | `/shop${typeof cartHash.bag}`;
  onClick: (event: MouseEvent<HTMLAnchorElement>) => void;
  icon: LucideIcon;
  title: string;
  count: number;
  total: number;
}) {
  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className="group flex min-h-16 items-center gap-3 rounded-2xl bg-card p-3 shadow-card transition-shadow hover:shadow-lift"
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon aria-hidden className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body font-semibold">{title}</span>
          <span className="block text-caption text-muted-foreground">{items(count)}</span>
        </span>
        <Price amount={total} size="sm" />
        <ChevronRight
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </li>
  );
}
