"use client";

import { Check, PackageCheck, ShoppingBasket, Trash2, Truck } from "lucide-react";
import type { MouseEvent } from "react";

import { OrderSent } from "@/components/shared/order-sent";
import { Price } from "@/components/shared/price";
import { StillNeeded } from "@/components/shared/still-needed";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import {
  formatDay,
  formatHour,
  returnFor,
  windowById,
  type CompleteBooking,
} from "@/features/booking/schedule";
import { useCart } from "@/features/cart/cart-provider";
import type { OrderField } from "@/features/laundry/lib/validate-order";
import { cn } from "@/lib/utils";

import { ItemMark } from "./item-mark";

export const SUMMARY_ID = "cart";
export const SUMMARY_HEADING_ID = "summary-heading";

// when, items, location, name, phone (see validateOrder).
const FIELD_COUNT = 5;

type Props = {
  booking: CompleteBooking | null;
  /** What's still missing, in page order, with the message to show. */
  missing: [OrderField, string][];
  /** Scroll to and focus the step or field that needs attention. */
  onFix: (field: OrderField) => void;
  /** The WhatsApp message the send button opens. */
  message: string;
  /** Validates; prevents the link from opening while something is missing. */
  onSend: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** The current order has been opened in WhatsApp. */
  sent: boolean;
};

/**
 * The order as a ticket (sticky beside the steps on desktop, after them on phones): the total on
 * a green head, a tear line, then items, pickup and return, what's free, a progress meter with a
 * "Still needed" checklist that jumps to each gap, and the WhatsApp button. Once WhatsApp has
 * opened, it says what happens next and offers a copy or a call in case the app didn't open.
 */
export function OrderSummary({ booking, missing, onFix, message, onSend, sent }: Props) {
  const { items, count, total, clear } = useCart();
  const back = booking ? returnFor(booking) : null;

  const when = [
    {
      icon: Truck,
      label: "Pickup",
      value: booking ? `${formatDay(booking.pickup)}, ${windowById(booking.window).time}` : null,
    },
    {
      icon: PackageCheck,
      label: "Back",
      value: back ? `${formatDay(back.iso)}, by ${formatHour(back.byHour)}` : null,
    },
  ];

  return (
    <aside
      id={SUMMARY_ID}
      aria-labelledby={SUMMARY_HEADING_ID}
      className="min-w-0 scroll-mt-20 lg:sticky lg:top-24 lg:self-start"
    >
      <div className="overflow-hidden rounded-3xl bg-card shadow-lift">
        {/* Head: the total on the brand green, like the top of a ticket. */}
        <div className="bg-mesh p-4 surface-inverse sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 id={SUMMARY_HEADING_ID} tabIndex={-1} className="display text-title outline-none">
              Your order
            </h2>
            {items.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clear}
                className="-my-2 -mr-2 h-11 px-3 text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <Trash2 aria-hidden /> Clear
              </Button>
            )}
          </div>
          <div className="mt-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-caption text-muted-foreground">Estimated total</p>
              <Price amount={total} size="xl" className="block" />
            </div>
            <p className="pb-1 text-right text-caption text-muted-foreground">
              <span className="figures">{count}</span> {count === 1 ? "item" : "items"}
              <br />
              Pay on delivery
            </p>
          </div>
        </div>

        {/* Tear line: dashes with a notch cut from each edge. */}
        <div aria-hidden className="relative h-0">
          <span className="absolute top-0 -left-3 size-6 -translate-y-1/2 rounded-full bg-background" />
          <span className="absolute inset-x-5 top-0 border-t-2 border-dashed border-border" />
          <span className="absolute top-0 -right-3 size-6 -translate-y-1/2 rounded-full bg-background" />
        </div>

        <div className="p-4 pt-5 sm:p-6">
          {items.length > 0 ? (
            <ul className="grid gap-2.5 text-body-sm">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <ItemMark id={i.id} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="text-muted-foreground figures">{i.qty} ×</span> {i.name}
                  </span>
                  <Price amount={i.price * i.qty} size="sm" className="shrink-0" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-3 text-body-sm text-muted-foreground">
              <ShoppingBasket aria-hidden className="size-5 shrink-0 text-primary" />
              Nothing added yet. Pick a basket to start.
            </p>
          )}

          <dl className="mt-4 grid grid-cols-2 gap-2">
            {when.map(({ icon: Icon, label, value }) => (
              <div key={label} className="min-w-0 rounded-2xl bg-secondary/70 p-3">
                <dt className="flex items-center gap-1.5 text-caption text-muted-foreground">
                  <Icon aria-hidden className="size-3.5 text-clay" /> {label}
                </dt>
                <dd
                  className={cn(
                    "mt-0.5 text-body-sm font-semibold",
                    !value && "font-normal text-muted-foreground",
                  )}
                >
                  {value ?? "Not chosen"}
                </dd>
              </div>
            ))}
          </dl>

          <ul aria-label="Included" className="mt-3 flex flex-wrap gap-1.5">
            {["Free pickup & delivery", "Free ironing"].map((label) => (
              <li
                key={label}
                className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-caption font-semibold text-success"
              >
                <Check aria-hidden className="size-3.5" /> {label}
              </li>
            ))}
          </ul>

          <StillNeeded missing={missing} total={FIELD_COUNT} onFix={onFix} className="mt-5" />

          <WhatsAppButton
            message={message}
            variant="clay"
            size="lg"
            block
            onClick={onSend}
            // Fits a 320px phone: the label never wraps, so trim the side padding.
            className="mt-4 max-xs:px-4!"
          >
            Send order on WhatsApp
          </WhatsAppButton>

          <OrderSent sent={sent} message={message} className="mt-4 p-4">
            <p className="mt-1 text-caption text-muted-foreground">
              Tap Send in WhatsApp to place it. Didn&apos;t open?
            </p>
          </OrderSent>

          <p className="mt-3 text-center text-caption text-muted-foreground">
            Cash or M-Pesa when it&apos;s back. No deposit.
          </p>
        </div>
      </div>
    </aside>
  );
}
