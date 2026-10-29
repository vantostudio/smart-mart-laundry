"use client";

import { ShoppingBag } from "lucide-react";

import { FloatingCartBar } from "@/components/shared/floating-cart-bar";
import { Button } from "@/components/ui/button";
import { useBag } from "@/features/cart/cart-provider";
import { deliveryFor } from "@/features/shop/lib/delivery";
import { ksh } from "@/lib/format";

/**
 * Floating bag pill at the bottom of /shop: count, total, the free-delivery nudge and "View bag".
 * Hidden while the bag is empty or open.
 */
export function ShopBagBar({ hidden, onOpen }: { hidden: boolean; onOpen: () => void }) {
  const { count, total } = useBag();
  const delivery = deliveryFor(total, "delivery");

  return (
    <FloatingCartBar
      show={count > 0 && !hidden}
      count={count}
      caption={delivery.free ? "Free delivery" : `${ksh(delivery.remaining)} to free delivery`}
      total={total}
      action={
        <Button type="button" variant="inverse" size="md" onClick={onOpen} className="shrink-0">
          <ShoppingBag aria-hidden /> View bag
        </Button>
      }
    />
  );
}
