"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { FloatingCartBar } from "@/components/shared/floating-cart-bar";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import { revealById } from "@/lib/scroll";

type Props = {
  /** The section "Review order" scrolls to. The bar hides once it's on screen or scrolled past. */
  targetId: string;
  focusId?: string;
};

/**
 * Floating basket pill on phones and tablets: item count, estimated total and "Review order".
 * Hidden while the cart is empty and whenever the target section is visible, so it never sits
 * on top of the form, the price list or the footer below it.
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

  return (
    <FloatingCartBar
      show={count > 0 && !targetReached}
      count={count}
      caption={`${count === 1 ? "item" : "items"} · pay on delivery`}
      total={total}
      className="lg:hidden"
      action={
        <Button type="button" variant="inverse" onClick={() => revealById(targetId, focusId)}>
          Review order <ArrowRight aria-hidden />
        </Button>
      }
    />
  );
}
