"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Price } from "@/components/shared/price";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { revealById } from "@/lib/scroll";
import { cn } from "@/lib/utils";

type Props = {
  /** The section "Continue" scrolls to. The bar hides once it's on screen or scrolled past. */
  targetId: string;
  focusId?: string;
};

/**
 * Floating basket pill pinned to the bottom on phones and tablets: item count, estimated total
 * and "Review order". Hidden while the cart is empty and whenever the target section is visible,
 * so it never sits on top of the form, the price list or the footer below it.
 */
export function StickyCartBar({ targetId, focusId = targetId }: Props) {
  const { count, total } = useCart();
  const [targetReached, setTargetReached] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setTargetReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const show = count > 0 && !targetReached;

  return (
    <div
      inert={!show}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-(--z-header) px-gutter pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden",
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
              {count === 1 ? "item" : "items"} · pay on delivery
            </span>
            <Price amount={total} size="sm" />
          </span>
        </p>
        <Button type="button" variant="inverse" onClick={() => revealById(targetId, focusId)}>
          Review order <ArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
