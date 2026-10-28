"use client";

import { ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/shared/card";
import { FormField } from "@/components/shared/form-field";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useCart } from "@/features/cart/cart-provider";
import { dayOptions, timeOptions } from "@/features/laundry/data";
import { buildPickupMessage } from "@/features/laundry/lib/pickup-message";

export function CartPanel() {
  const { items, total, setQty, remove, clear } = useCart();
  const [location, setLocation] = useState("");
  const [pickupDay, setPickupDay] = useState<string>(dayOptions[0]);
  const [pickupTime, setPickupTime] = useState<string>(timeOptions[1]);
  const [returnDay, setReturnDay] = useState<string>(dayOptions[1]);
  const [returnTime, setReturnTime] = useState<string>(timeOptions[6]);

  const message = buildPickupMessage(items, {
    location,
    pickupDay,
    pickupTime,
    returnDay,
    returnTime,
  });

  const schedule = [
    { label: "Pickup day", value: pickupDay, set: setPickupDay, options: dayOptions },
    { label: "Pickup time", value: pickupTime, set: setPickupTime, options: timeOptions },
    { label: "Return day", value: returnDay, set: setReturnDay, options: dayOptions },
    { label: "Return time", value: returnTime, set: setReturnTime, options: timeOptions },
  ];

  return (
    <aside
      id="cart"
      className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start"
      aria-label="Laundry cart"
    >
      <Card variant="brand" radius="xl" padding="lg">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-title font-semibold">
            <ShoppingBag className="size-5 text-clay" aria-hidden /> Your pickup
          </h2>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="h-8 px-3 text-muted-foreground hover:bg-secondary hover:text-clay"
            >
              <Trash2 /> Clear
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border p-4 text-body-sm text-muted-foreground">
            Your cart is empty — add baskets, duvets, mats or shoes from the list and they will show
            up here.
          </p>
        ) : (
          <>
            <ul className="mt-5 space-y-3">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 border-b border-border pb-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-semibold">{i.name}</p>
                    <Price amount={i.price * i.qty} size="sm" className="text-clay" />
                  </div>
                  <QuantityStepper
                    tone="inverse"
                    label={i.name}
                    value={i.qty}
                    onChange={(qty) => setQty(i.id, qty)}
                  />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${i.name} entirely`}
                    onClick={() => remove(i.id)}
                    className="text-muted-foreground hover:bg-secondary hover:text-clay"
                  >
                    <X />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-body-sm text-muted-foreground">Estimated total</span>
              <Price amount={total} size="lg" className="text-clay" />
            </div>
          </>
        )}

        <div className="mt-6 rounded-2xl border border-border bg-card p-4">
          <p className="text-body-sm font-semibold">Collection &amp; return details</p>
          <p className="mt-1 text-caption text-muted-foreground">
            Where should we collect, and when do you need everything back?
          </p>
          <div className="mt-4 grid gap-3">
            <FormField label="Collection location">
              <Input
                tone="inverse"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Chuka town, near the university"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              {schedule.map((f) => (
                <FormField key={f.label} label={f.label}>
                  <NativeSelect
                    tone="inverse"
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                  >
                    {f.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </NativeSelect>
                </FormField>
              ))}
            </div>
          </div>
        </div>

        {items.length > 0 ? (
          <WhatsAppButton
            message={message}
            variant="gradient-sunset"
            size="lg"
            block
            className="mt-6"
          >
            Checkout on WhatsApp
          </WhatsAppButton>
        ) : (
          <Button variant="gradient-sunset" size="lg" block disabled className="mt-6">
            Checkout on WhatsApp
          </Button>
        )}
        <p className="mt-3 text-center text-caption text-muted-foreground">
          Pay on delivery — cash or M-Pesa when your clothes come back. Pickup, delivery and ironing
          are always free.
        </p>
      </Card>
    </aside>
  );
}
