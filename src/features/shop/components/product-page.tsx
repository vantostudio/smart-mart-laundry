"use client";

import { ArrowLeft, CheckCircle2, ShoppingBag, Store, Truck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBag } from "@/features/cart/cart-provider";
import { categoryLabels } from "@/features/products/labels";
import type { PublicProduct } from "@/features/products/public";
import { useShopSettings } from "@/features/settings/shop-settings-provider";
import { bagLine, bagLineId } from "@/features/shop/lib/shop-message";
import { shopMessages } from "@/features/shop/messages";
import { ksh } from "@/lib/format";
import { cn } from "@/lib/utils";

import { ProductPhoto } from "./product-photo";

/**
 * `/shop/<code>`: the same things the quick view shows (photos, price, condition, sizes, stock,
 * note, Add to bag) as a page of its own, server-rendered so search engines can read it. The quick
 * view in the shop stays what shoppers use while browsing.
 */
export function ProductPage({ product: p }: { product: PublicProduct }) {
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
    <article className="container-page pt-6 pb-section sm:pt-8">
      <Button asChild variant="ghost" size="md" className="-ml-3">
        <Link href="/shop">
          <ArrowLeft aria-hidden /> {shopMessages.productPage.back}
        </Link>
      </Button>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ul aria-label="Photos" className="grid min-w-0 grid-cols-2 gap-3 lg:self-start">
          {(p.photos.length > 0 ? p.photos : [null]).map((photo, i) => (
            <li
              key={photo ?? "none"}
              className={cn(
                "relative aspect-4/5 overflow-hidden rounded-3xl bg-muted",
                i === 0 && "col-span-2",
              )}
            >
              <ProductPhoto
                src={photo}
                alt={i === 0 ? p.name : ""}
                sizes={
                  i === 0 ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 280px, 50vw"
                }
                priority={i === 0}
              />
            </li>
          ))}
        </ul>

        <div className="min-w-0">
          <p className="eyebrow">{categoryLabels[p.category]}</p>
          <h1 className="mt-2 display text-display-lg wrap-anywhere">{p.name}</h1>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Price amount={p.price} size="lg" />
            <div className="flex flex-wrap gap-1.5">
              <Badge variant={mtumba ? "soft" : "secondary"}>
                {mtumba ? "Mtumba" : "Brand new"}
              </Badge>
              <Badge variant="code">{p.code}</Badge>
            </div>
          </div>
          {p.note && (
            <p className="mt-3 text-body-sm wrap-anywhere text-muted-foreground">{p.note}</p>
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

          <div aria-live="polite" className="mt-6">
            {added ? (
              <div className="grid gap-2">
                <p className="flex items-center gap-2 text-body-sm font-semibold text-success">
                  <CheckCircle2 aria-hidden className="size-4 shrink-0" />
                  Added to your bag
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/shop">Keep shopping</Link>
                  </Button>
                  <Button asChild variant="primary" size="lg">
                    <Link href="/shop#bag">
                      <ShoppingBag aria-hidden /> View bag
                    </Link>
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
        </div>
      </div>
    </article>
  );
}
