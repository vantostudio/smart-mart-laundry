"use client";

import { CheckCircle2, ShoppingBag, Store, Truck } from "lucide-react";
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
import { categoryLabels } from "@/features/products/labels";
import type { PublicProduct } from "@/features/products/public";
import { useShopSettings } from "@/features/settings/shop-settings-provider";
import { bagLine, bagLineId } from "@/features/shop/lib/shop-message";
import { shopMessages, type LoadProblem } from "@/features/shop/messages";
import { ksh } from "@/lib/format";
import { cn } from "@/lib/utils";

import { ProductPhoto } from "./product-photo";

type Props = {
  open: boolean;
  /** Null while it loads, or when it couldn't be loaded. */
  product: PublicProduct | null;
  problem: LoadProblem | null;
  onRetry: () => void;
  onOpenChange: (open: boolean) => void;
  onViewBag: () => void;
};

/**
 * Quick view: photos, condition, size when there's one to choose, quantity, and Add to bag. An old
 * or shared link can point at something sold or missing, so the sheet says so.
 */
export function ProductSheet({ open, product, problem, onRetry, onOpenChange, onViewBag }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {/* Keyed, so picking another item starts with a clean size and quantity. */}
        {product ? (
          <ProductDetails
            key={product.code}
            product={product}
            onClose={() => onOpenChange(false)}
            onViewBag={onViewBag}
          />
        ) : problem ? (
          <ProductProblem problem={problem} onRetry={onRetry} onClose={() => onOpenChange(false)} />
        ) : (
          <ProductLoading />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProductLoading() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{shopMessages.loadingItem}</SheetTitle>
        <SheetDescription className="sr-only">{shopMessages.loadingItem}</SheetDescription>
      </SheetHeader>
      <SheetBody className="pb-5">
        <div aria-hidden className="aspect-4/5 w-full animate-pulse rounded-3xl bg-muted" />
      </SheetBody>
    </>
  );
}

function ProductProblem({
  problem,
  onRetry,
  onClose,
}: {
  problem: LoadProblem;
  onRetry: () => void;
  onClose: () => void;
}) {
  const { title, body } = shopMessages.item[problem];
  return (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{body}</SheetDescription>
      </SheetHeader>
      <SheetFooter className="grid gap-2">
        {problem !== "not-found" && (
          <Button type="button" size="lg" block onClick={onRetry}>
            {shopMessages.retry}
          </Button>
        )}
        <Button
          type="button"
          variant={problem === "not-found" ? "primary" : "secondary"}
          size="lg"
          block
          onClick={onClose}
        >
          {shopMessages.backToShop}
        </Button>
        {problem === "not-found" && (
          <WhatsAppButton
            message={shopMessages.askWhatsAppMessage}
            variant="secondary"
            size="lg"
            block
          >
            {shopMessages.askWhatsApp}
          </WhatsAppButton>
        )}
      </SheetFooter>
    </>
  );
}

function ProductDetails({
  product: p,
  onClose,
  onViewBag,
}: {
  product: PublicProduct;
  onClose: () => void;
  onViewBag: () => void;
}) {
  const { items, add } = useBag();
  const { deliveryFreeFrom } = useShopSettings();
  const [size, setSize] = useState<string | null>(p.sizes.length === 1 ? p.sizes[0]! : null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);

  const mtumba = p.condition === "mtumba";
  const hasSizes = p.sizes.length > 0;
  const inBag = items.find((i) => i.id === bagLineId(p, size));
  const soldOutForYou = inBag !== undefined && inBag.qty >= p.stock;

  function addToBag() {
    if (hasSizes && !size) {
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
        <SheetDescription>{categoryLabels[p.category]}</SheetDescription>
      </SheetHeader>

      <SheetBody className="pb-5">
        <ul
          aria-label="Photos"
          className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6"
        >
          {(p.photos.length > 0 ? p.photos : [null]).map((photo, i) => (
            <li
              key={photo ?? "none"}
              className={cn(
                "relative aspect-4/5 shrink-0 snap-start overflow-hidden rounded-3xl bg-muted",
                p.photos.length > 1 ? "w-[82%]" : "w-full",
              )}
            >
              <ProductPhoto
                src={photo}
                alt={i === 0 ? p.name : ""}
                sizes="(min-width: 1024px) 400px, 90vw"
                priority={i === 0}
              />
            </li>
          ))}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Price amount={p.price} size="lg" />
          <div className="flex flex-wrap gap-1.5">
            <Badge variant={mtumba ? "soft" : "secondary"}>{mtumba ? "Mtumba" : "Brand new"}</Badge>
            <Badge variant="code">{p.code}</Badge>
          </div>
        </div>
        {p.note && (
          <p className="mt-2 text-body-sm wrap-anywhere text-muted-foreground">{p.note}</p>
        )}
        {p.stock === 1 && (
          <p className="mt-1 text-caption text-muted-foreground">
            One piece only. We confirm it&apos;s still here when you order.
          </p>
        )}

        {hasSizes && (
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
        )}

        {p.stock > 1 && (
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
            Delivered anywhere in Chuka, free over {ksh(deliveryFreeFrom)}. Pay on delivery.
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
