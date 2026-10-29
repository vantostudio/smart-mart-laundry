"use client";

import { ShoppingBag } from "lucide-react";

import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { useBag } from "@/features/cart/cart-provider";
import { deliveryFor } from "@/features/shop/lib/delivery";
import { ksh } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Floating bag pill at the bottom of /shop: count, total, the free-delivery nudge and "View bag".
 * Hidden while the bag is empty or open.
 */
export function ShopBagBar({ hidden, onOpen }: { hidden: boolean; onOpen: () => void }) {
  const { count, total } = useBag();
  const show = count > 0 && !hidden;
  const delivery = deliveryFor(total, "delivery");

  return (
    <div
      inert={!show}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-(--z-header) px-gutter pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "transition-[translate,visibility,opacity] duration-300 ease-out-expo",
        show ? "visible translate-y-0 opacity-100" : "invisible translate-y-full opacity-0",
      )}
    >
      <div className="pointer-events-auto mx-auto flex max-w-narrow items-center justify-between gap-3 rounded-full bg-primary p-1.5 pl-2 surface-inverse shadow-lift">
        <p
          className="flex min-w-0 items-center gap-2.5 text-body-sm font-semibold"
          aria-live="polite"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-clay text-clay-foreground figures">
            {count}
          </span>
          <span className="grid min-w-0 leading-tight">
            <span className="truncate text-caption text-muted-foreground">
              {delivery.free ? "Free delivery" : `${ksh(delivery.remaining)} to free delivery`}
            </span>
            <Price amount={total} size="sm" />
          </span>
        </p>
        <Button type="button" variant="inverse" size="md" onClick={onOpen} className="shrink-0">
          <ShoppingBag aria-hidden /> View bag
        </Button>
      </div>
    </div>
  );
}
