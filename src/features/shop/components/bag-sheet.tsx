"use client";

import { ArrowRight, ShoppingBag, Store, Truck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { AreaPicker } from "@/components/shared/area-picker";
import { ChoiceChips } from "@/components/shared/choice-chips";
import { OptionalNote } from "@/components/shared/optional-note";
import { OrderSent } from "@/components/shared/order-sent";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
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
import { site } from "@/config/site";
import { useBag } from "@/features/cart/cart-provider";
import { deliveryFor, fulfilOptions, type FulfilMethod } from "@/features/shop/lib/delivery";
import {
  buildShopMessage,
  productForLine,
  shopGapLabels,
  shopGaps,
} from "@/features/shop/lib/shop-message";
import { ksh } from "@/lib/format";
import { unsplash } from "@/lib/images";
import { useOrderPlace } from "@/lib/saved-details";

const fulfilIcons = { delivery: Truck, pickup: Store };
const AREA_ID = "bag-area";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * The shop bag: lines with size and quantity, delivery (with the free-delivery nudge and the
 * area as three buttons) or pick up in store, an optional note, and the WhatsApp order. No name
 * or phone: the message comes from the customer's own WhatsApp. The button says what's missing.
 */
export function BagSheet({ open, onOpenChange }: Props) {
  const { items, count, total, setQty, clear } = useBag();
  const [method, setMethod] = useState<FulfilMethod>("delivery");
  const { area, setArea, note, setNote, remember } = useOrderPlace(site.areas);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const order = { method, area, note };
  const gaps = shopGaps(count, order);
  const delivery = deliveryFor(total, method);
  const message = buildShopMessage(items, order);
  const sent = sentMessage === message;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader className="flex items-center justify-between gap-3">
          <div>
            <SheetTitle>Your bag</SheetTitle>
            <SheetDescription>
              {count === 0
                ? "Nothing here yet."
                : `${count} ${count === 1 ? "item" : "items"} · pay on delivery or in store`}
            </SheetDescription>
          </div>
        </SheetHeader>

        {count === 0 ? (
          <SheetBody className="grid place-items-center pb-10 text-center">
            <div className="grid justify-items-center gap-3 py-8">
              <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
                <ShoppingBag aria-hidden className="size-7" />
              </span>
              <p className="text-body-sm text-muted-foreground">
                Tap + on anything you like to add it here.
              </p>
              <Button type="button" variant="primary" size="lg" onClick={() => onOpenChange(false)}>
                Browse the shop
              </Button>
            </div>
          </SheetBody>
        ) : (
          <>
            <SheetBody className="pb-6">
              <ul className="grid gap-3">
                {items.map((line) => {
                  const product = productForLine(line.id);
                  return (
                    <li key={line.id} className="flex items-center gap-3">
                      <span className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-muted">
                        {product && (
                          <Image
                            src={unsplash(product.images[0]!, 200)}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-semibold">{line.name}</p>
                        <p className="truncate text-caption text-muted-foreground">{line.detail}</p>
                        <Price amount={line.price * line.qty} size="sm" />
                      </div>
                      <QuantityStepper
                        label={line.name}
                        value={line.qty}
                        max={line.max}
                        onChange={(n) => setQty(line.id, n)}
                        className="shrink-0"
                      />
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onClick={clear}
                className="mt-1 min-h-11 text-caption font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Empty bag
              </button>

              <div className="mt-4 grid gap-2">
                <p className="text-body-sm font-semibold">How do you want it?</p>
                <ChoiceChips
                  label="How do you want it?"
                  columns={2}
                  options={fulfilOptions.map((o) => ({
                    value: o.id,
                    label: o.label,
                    sublabel: o.sublabel,
                    icon: fulfilIcons[o.id],
                  }))}
                  value={method}
                  onChange={setMethod}
                />
                {method === "delivery" && (
                  <p aria-live="polite" className="text-caption text-muted-foreground">
                    {delivery.free ? (
                      <span className="font-semibold text-success">Free delivery unlocked.</span>
                    ) : (
                      <>
                        Add{" "}
                        <span className="font-semibold text-foreground">
                          {ksh(delivery.remaining)}
                        </span>{" "}
                        more for free delivery.
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="mt-4 grid gap-2">
                {method === "delivery" && (
                  <AreaPicker id={AREA_ID} value={area} onChange={setArea} />
                )}
                <OptionalNote
                  value={note}
                  onChange={setNote}
                  placeholder="Another size or colour if it's gone, or a hostel or gate"
                />
              </div>
            </SheetBody>

            <SheetFooter className="grid gap-2">
              <dl className="grid gap-1 text-body-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="figures">{ksh(total)}</dd>
                </div>
                {method === "delivery" && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Delivery</dt>
                    <dd className={delivery.fee === 0 ? "font-semibold text-success" : "figures"}>
                      {delivery.fee === 0 ? "Free" : ksh(delivery.fee)}
                    </dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between gap-3 font-semibold">
                  <dt>Total</dt>
                  <dd>
                    <Price amount={total + delivery.fee} size="md" />
                  </dd>
                </div>
              </dl>
              {gaps[0] ? (
                <Button
                  type="button"
                  size="lg"
                  block
                  onClick={() =>
                    gaps[0] === "items"
                      ? onOpenChange(false)
                      : document
                          .getElementById(AREA_ID)
                          ?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                >
                  {shopGapLabels[gaps[0]]} <ArrowRight aria-hidden />
                </Button>
              ) : (
                <WhatsAppButton
                  message={message}
                  variant="clay"
                  size="lg"
                  block
                  onClick={() => {
                    remember();
                    setSentMessage(message);
                  }}
                  className="max-xs:px-4!"
                >
                  Send order on WhatsApp
                </WhatsAppButton>
              )}
              <OrderSent sent={sent} message={message} className="p-3">
                <p className="mt-0.5 text-caption text-muted-foreground">
                  Tap Send there. We&apos;ll confirm it&apos;s all in stock. Didn&apos;t open?
                </p>
              </OrderSent>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
