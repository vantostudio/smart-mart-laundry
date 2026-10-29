"use client";

import { CheckCircle2, ShoppingBag, Store, Truck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBag } from "@/features/cart/cart-provider";
import { categoryName, SHOP_DELIVERY, type Product } from "@/features/shop/data";
import { bagLine, bagLineId } from "@/features/shop/lib/shop-message";
import { ksh } from "@/lib/format";
import { unsplash } from "@/lib/images";
import { cn } from "@/lib/utils";

type Props = {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onViewBag: () => void;
};

/** Quick view: photos, condition, size (required), quantity for new stock, and Add to bag. */
export function ProductSheet({ product, onOpenChange, onViewBag }: Props) {
  return (
    <Sheet open={product !== null} onOpenChange={onOpenChange}>
      <SheetContent>
        {/* Keyed, so picking another item starts with a clean size and quantity. */}
        {product && (
          <ProductDetails
            key={product.id}
            product={product}
            onClose={() => onOpenChange(false)}
            onViewBag={onViewBag}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProductDetails({
  product: p,
  onClose,
  onViewBag,
}: {
  product: Product;
  onClose: () => void;
  onViewBag: () => void;
}) {
  const { items, add } = useBag();
  const [size, setSize] = useState<string | null>(p.sizes.length === 1 ? p.sizes[0]! : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const oneOff = p.condition === "mtumba";
  const inBag = size ? items.find((i) => i.id === bagLineId(p, size)) : undefined;
  const soldOutForYou = inBag !== undefined && inBag.qty >= p.stock;

  function addToBag() {
    if (!size) {
      setError(true);
      document.getElementById("size-picker")?.scrollIntoView({ block: "center" });
      return;
    }
    add(bagLine(p, size), qty);
    setAdded(true);
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>{p.name}</SheetTitle>
        <SheetDescription>
          {[p.brand, p.colour, categoryName(p.category)].filter(Boolean).join(" · ")}
        </SheetDescription>
      </SheetHeader>

      <SheetBody className="pb-5">
        <ul
          aria-label="Photos"
          className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6"
        >
          {p.images.map((id, i) => (
            <li
              key={id}
              className={cn(
                "relative aspect-4/5 shrink-0 snap-start overflow-hidden rounded-3xl bg-muted",
                p.images.length > 1 ? "w-[82%]" : "w-full",
              )}
            >
              <Image
                src={unsplash(id, 800)}
                alt={i === 0 ? `${p.name}, ${p.colour}` : ""}
                fill
                sizes="(min-width: 1024px) 400px, 90vw"
                priority={i === 0}
                className="object-cover"
              />
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Price amount={p.price} size="lg" />
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={oneOff ? "soft" : "secondary"}>{oneOff ? "Mtumba" : "Brand new"}</Badge>
            <Badge variant="code">{p.code}</Badge>
          </div>
        </div>
        {p.note && <p className="mt-2 text-body-sm text-muted-foreground">{p.note}</p>}
        {oneOff && (
          <p className="mt-1 text-caption text-muted-foreground">
            One piece only. We confirm it&apos;s still here when you order.
          </p>
        )}

        <div id="size-picker" className="mt-5 grid gap-2">
          <p className="text-body-sm font-semibold">
            {p.sizes.length === 1 ? "Size" : "Choose a size"}
          </p>
          <ChoiceChips
            label="Size"
            columns={p.sizes.length >= 4 ? 4 : (Math.max(2, p.sizes.length) as 2 | 3)}
            options={p.sizes.map((s) => ({ value: s, label: s }))}
            value={size}
            onChange={(s) => {
              setSize(s);
              setError(false);
              setAdded(false);
            }}
            aria-invalid={error || undefined}
            aria-describedby={error ? "size-error" : undefined}
          />
          {error && (
            <p id="size-error" className="text-caption font-semibold text-destructive">
              Choose a size first.
            </p>
          )}
        </div>

        {!oneOff && p.stock > 1 && (
          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-body-sm font-semibold">Quantity</p>
            <QuantityStepper
              label={p.name}
              value={qty}
              max={p.stock}
              onChange={(n) => setQty(Math.max(1, n))}
            />
          </div>
        )}

        <ul className="mt-5 grid gap-2 rounded-2xl bg-secondary/70 p-3.5 text-caption text-muted-foreground">
          <li className="flex items-start gap-2">
            <Truck aria-hidden className="mt-px size-4 shrink-0 text-clay" />
            Delivered anywhere in Chuka, free over {ksh(SHOP_DELIVERY.freeFrom)}. Pay on delivery.
          </li>
          <li className="flex items-start gap-2">
            <Store aria-hidden className="mt-px size-4 shrink-0 text-clay" />
            Or pick it up and try it on at Chuka General.
          </li>
        </ul>

        <WhatsAppButton
          message={`Hi Street Mart, is the ${p.name} (${p.code})${size ? ` in size ${size}` : ""} still available?`}
          variant="ghost"
          size="md"
          className="mt-3 -ml-3"
        >
          Ask about this item
        </WhatsAppButton>
      </SheetBody>

      <SheetFooter>
        <div aria-live="polite">
          {added ? (
            <div className="grid gap-2">
              <p className="flex items-center gap-2 text-body-sm font-semibold text-success">
                <CheckCircle2 aria-hidden className="size-4 shrink-0" />
                Added to your bag
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="secondary" size="lg" onClick={onClose}>
                  Keep shopping
                </Button>
                <Button type="button" variant="primary" size="lg" onClick={onViewBag}>
                  <ShoppingBag aria-hidden /> View bag
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              size="lg"
              block
              onClick={addToBag}
              disabled={soldOutForYou}
              className="disabled:opacity-60"
            >
              <ShoppingBag aria-hidden />
              {soldOutForYou ? "Already in your bag" : `Add to bag · ${ksh(p.price * qty)}`}
            </Button>
          )}
        </div>
      </SheetFooter>
    </>
  );
}
