"use client";

import { ShoppingBag, WashingMachine, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBag, useCart } from "@/features/cart/cart-provider";
import { BAG_HASH, openBag } from "@/features/shop/lib/open-bag";

function CountLink({
  href,
  label,
  count,
  icon: Icon,
  onClick,
}: {
  href: "/laundry#cart" | `/shop${typeof BAG_HASH}`;
  label: string;
  count: number;
  icon: LucideIcon;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Button asChild variant="ghost" className="size-11 p-0">
      <Link
        href={href}
        onClick={onClick}
        aria-label={`${label}, ${count} ${count === 1 ? "item" : "items"}`}
      >
        <Icon aria-hidden className="size-5" />
        <Badge
          variant="gradient"
          size="sm"
          className="absolute top-0 right-0 size-5 justify-center p-0 figures"
        >
          {count}
        </Badge>
      </Link>
    </Button>
  );
}

/**
 * Header buttons for the laundry basket and the shop bag, each shown only while it has items.
 * That includes the server render and first client render (carts load after hydration), so
 * there's no mismatch. On /shop the bag button opens the bag in place.
 */
export function CartLink() {
  const { count } = useCart();
  const { count: bagCount } = useBag();
  const pathname = usePathname();

  return (
    <>
      {count > 0 && (
        <CountLink href="/laundry#cart" label="Laundry cart" count={count} icon={WashingMachine} />
      )}
      {bagCount > 0 && (
        <CountLink
          href={`/shop${BAG_HASH}`}
          label="Shop bag"
          count={bagCount}
          icon={ShoppingBag}
          onClick={(event) => {
            if (pathname !== "/shop") return;
            event.preventDefault();
            openBag();
          }}
        />
      )}
    </>
  );
}
