"use client";

import { CheckCircle2, ShoppingBag, Store, Truck } from "lucide-react";
import { useState, type ReactNode } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBag } from "@/features/cart/cart-provider";
import type { PublicProduct } from "@/features/products/public";
import { useShopSettings } from "@/features/settings/shop-settings-provider";
import { bagLine, bagLineId } from "@/features/shop/lib/shop-message";
import { shopMessages } from "@/features/shop/messages";

/* What the quick view and the product page share, so the two can't drift apart. */

const m = shopMessages.product;

/** The size, quantity and bag state of one product. */
export function useProductChoice(p: PublicProduct) {
  const { items, add } = useBag();
  const [size, setSize] = useState<string | null>(p.sizes.length === 1 ? p.sizes[0]! : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const inBag = items.find((i) => i.id === bagLineId(p, size));

  function chooseSize(next: string) {
    setSize(next);
    setError(false);
    setAdded(false);
  }

  function addToBag() {
    if (p.sizes.length > 0 && !size) {
      setError(true);
      document.getElementById("size-picker")?.scrollIntoView({ block: "center" });
      return;
    }
    add(bagLine(p, size), qty);
    setAdded(true);
  }

  return {
    size,
    chooseSize,
    qty,
    setQty,
    error,
    added,
    addToBag,
    soldOutForYou: inBag !== undefined && inBag.qty >= p.stock,
  };
}

export type ProductChoice = ReturnType<typeof useProductChoice>;

/** Price, condition, code, note and the one-piece warning. */
export function ProductSummary({ product: p }: { product: PublicProduct }) {
  const mtumba = p.condition === "mtumba";
  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Price amount={p.price} size="lg" />
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={mtumba ? "soft" : "secondary"}>{mtumba ? m.mtumba : m.brandNew}</Badge>
          <Badge variant="code">{p.code}</Badge>
        </div>
      </div>
      {p.note && <p className="mt-2 text-body-sm wrap-anywhere text-muted-foreground">{p.note}</p>}
      {p.stock === 1 && <p className="mt-1 text-caption text-muted-foreground">{m.onePiece}</p>}
    </>
  );
}

/** The size chips and quantity stepper, each shown only when there is a choice to make. */
export function ProductOptions({
  product: p,
  choice,
}: {
  product: PublicProduct;
  choice: ProductChoice;
}) {
  return (
    <>
      {p.sizes.length > 0 && (
        <div id="size-picker" className="mt-5 grid gap-2">
          <p className="text-body-sm font-semibold">
            {p.sizes.length === 1 ? m.size : m.chooseSize}
          </p>
          <ChoiceChips
            label={m.size}
            columns={p.sizes.length >= 4 ? 4 : (Math.max(2, p.sizes.length) as 2 | 3)}
            options={p.sizes.map((s) => ({ value: s, label: s }))}
            value={choice.size}
            onChange={choice.chooseSize}
            aria-invalid={choice.error || undefined}
            aria-describedby={choice.error ? "size-error" : undefined}
          />
          {choice.error && (
            <p id="size-error" className="text-caption font-semibold text-destructive">
              {m.chooseSizeFirst}
            </p>
          )}
        </div>
      )}

      {p.stock > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-body-sm font-semibold">{m.quantity}</p>
          <QuantityStepper
            label={p.name}
            value={choice.qty}
            max={p.stock}
            onChange={(n) => choice.setQty(Math.max(1, n))}
          />
        </div>
      )}
    </>
  );
}

/** How it reaches you, and a way to ask about it. */
export function ProductHelp({ product: p, size }: { product: PublicProduct; size: string | null }) {
  const { deliveryFreeFrom } = useShopSettings();
  return (
    <>
      <ul className="mt-5 grid gap-2 rounded-2xl bg-secondary/70 p-3.5 text-caption text-muted-foreground">
        <li className="flex items-start gap-2">
          <Truck aria-hidden className="mt-px size-4 shrink-0 text-clay" />
          {m.delivery(deliveryFreeFrom)}
        </li>
        <li className="flex items-start gap-2">
          <Store aria-hidden className="mt-px size-4 shrink-0 text-clay" />
          {m.pickup}
        </li>
      </ul>

      <WhatsAppButton
        message={m.askMessage(p, size)}
        variant="ghost"
        size="md"
        className="mt-3 -ml-3"
      >
        {m.ask}
      </WhatsAppButton>
    </>
  );
}

/** Add to bag, then "Added" with `children` as the next steps. */
export function AddToBag({
  product: p,
  choice,
  children,
}: {
  product: PublicProduct;
  choice: ProductChoice;
  children: ReactNode;
}) {
  if (choice.added) {
    return (
      <div className="grid gap-2">
        <p className="flex items-center gap-2 text-body-sm font-semibold text-success">
          <CheckCircle2 aria-hidden className="size-4 shrink-0" />
          {m.added}
        </p>
        <div className="grid grid-cols-2 gap-2">{children}</div>
      </div>
    );
  }
  return (
    <Button
      type="button"
      size="lg"
      block
      onClick={choice.addToBag}
      disabled={choice.soldOutForYou}
      className="disabled:opacity-60"
    >
      <ShoppingBag aria-hidden />
      {choice.soldOutForYou ? m.alreadyInBag : m.addToBag(p.price * choice.qty)}
    </Button>
  );
}
