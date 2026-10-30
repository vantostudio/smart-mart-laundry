"use client";

import { ArrowRight, CalendarDays, Check, MapPin, Plus, Sun } from "lucide-react";
import { useState } from "react";

import { AreaPicker } from "@/components/shared/area-picker";
import { DateCalendar } from "@/components/shared/date-calendar";
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
import {
  addDays,
  COLLECTION_DAYS,
  firstCollectionDay,
  formatDay,
  isCollectionDay,
  isReturnDay,
  isSameDay,
  RETURN_WITHIN,
  toIsoDate,
  type BookingDates,
} from "@/features/booking/schedule";
import { useCart } from "@/features/cart/cart-provider";
import { laundryItems } from "@/features/laundry/data";
import {
  bookingGaps,
  buildPickupMessage,
  gapLabels,
  type BookingGap,
} from "@/features/laundry/lib/pickup-message";
import { cn } from "@/lib/utils";
import { useOrderPlace } from "@/lib/saved-details";

import { categoryTint, ItemArt } from "./item-art";

const WHEN_ID = "booking-when";
const AREA_ID = "booking-area";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dates: BookingDates;
  onDatesChange: (dates: BookingDates) => void;
  /** The visitor's clock; null until hydrated. */
  now: Date | null;
};

const categoryOf = new Map(laundryItems.map((i) => [i.id, i.category]));

/**
 * Laundry checkout, shop style: the items, a calendar for the collection and return days, the
 * area as three big buttons, then one WhatsApp message. No typing (an optional note aside); the
 * button says what's missing until everything is picked.
 */
export function BookingSheet({ open, onOpenChange, dates, onDatesChange, now }: Props) {
  const { items, count, total, setQty } = useCart();
  const { area, setArea, note, setNote, remember } = useOrderPlace(site.areas);
  // Which day the calendar is choosing; it moves on to Return once collection is picked.
  const [picking, setPicking] = useState<"pickup" | "back">(dates.pickup ? "back" : "pickup");
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const details = { ...dates, area, note };
  const gaps = bookingGaps(count, details);
  const message = buildPickupMessage(items, details);

  function choose(day: string) {
    if (picking === "pickup") {
      // Keep the return if it still fits, otherwise suggest the next day (the usual choice);
      // the calendar moves on to Return so it can be changed with one tap.
      const back = dates.back && isReturnDay(dates.back, day) ? dates.back : addDays(day, 1);
      onDatesChange({ pickup: day, back });
      setPicking("back");
    } else {
      onDatesChange({ ...dates, back: day });
    }
  }

  function showGap(gap: BookingGap) {
    if (gap === "items") return onOpenChange(false);
    if (gap === "pickup" || gap === "back") setPicking(gap);
    const target = document.getElementById(gap === "area" ? AREA_ID : WHEN_ID);
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const today = now ? toIsoDate(now) : null;
  const first = now ? firstCollectionDay(now) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Book pickup</SheetTitle>
          <SheetDescription>
            {count} {count === 1 ? "item" : "items"} · free pickup, ironing and delivery
          </SheetDescription>
        </SheetHeader>

        <SheetBody className="grid content-start gap-6 pb-6">
          {/* Items */}
          <section aria-label="Your items">
            <ul className="grid gap-2.5">
              {items.map((line) => {
                const category = categoryOf.get(line.id);
                return (
                  <li key={line.id} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-14 shrink-0 items-center justify-center rounded-2xl p-1",
                        category && categoryTint[category],
                      )}
                    >
                      <ItemArt id={line.id} className="w-full" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-semibold">{line.name}</p>
                      <Price amount={line.price * line.qty} size="sm" />
                    </div>
                    <QuantityStepper
                      label={line.name}
                      value={line.qty}
                      onChange={(n) => setQty(line.id, n)}
                      className="shrink-0"
                    />
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="mt-1 inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-primary"
            >
              <Plus aria-hidden className="size-4" /> Add more
            </button>
          </section>

          {/* When */}
          <section id={WHEN_ID} aria-labelledby="when-title" className="scroll-mt-4">
            <h3 id="when-title" className="flex items-center gap-2 text-body font-semibold">
              <CalendarDays aria-hidden className="size-5 text-clay" /> When?
            </h3>
            <div role="radiogroup" aria-label="Choosing" className="mt-3 grid grid-cols-2 gap-2">
              {(
                [
                  ["pickup", "Collection", dates.pickup],
                  ["back", "Return", dates.back],
                ] as const
              ).map(([key, title, day]) => (
                <button
                  key={key}
                  type="button"
                  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                  role="radio"
                  aria-checked={picking === key}
                  disabled={key === "back" && !dates.pickup}
                  onClick={() => setPicking(key)}
                  className={cn(
                    "flex min-h-14 flex-col items-start justify-center rounded-2xl border px-3.5 py-2 text-left transition-colors",
                    picking === key
                      ? "border-primary bg-success-soft ring-1 ring-primary"
                      : "border-border bg-card disabled:opacity-50",
                  )}
                >
                  <span className="text-caption font-semibold text-muted-foreground">{title}</span>
                  <span className="flex items-center gap-1.5 text-body-sm font-bold">
                    {day ? (
                      <>
                        <Check aria-hidden className="size-4 text-success" />
                        {formatDay(day, { month: true })}
                      </>
                    ) : (
                      <span className="font-semibold text-muted-foreground">Tap a day</span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3">
              {now && first ? (
                <DateCalendar
                  key={picking}
                  label={picking === "pickup" ? "Collection day" : "Return day"}
                  start={dates.pickup}
                  end={dates.back}
                  active={picking === "pickup" ? dates.pickup : dates.back}
                  isEnabled={(day) =>
                    picking === "pickup"
                      ? isCollectionDay(day, now)
                      : dates.pickup !== null && isReturnDay(day, dates.pickup)
                  }
                  onSelect={choose}
                  from={picking === "pickup" ? first : (dates.pickup ?? first)}
                  to={
                    picking === "pickup"
                      ? addDays(toIsoDate(now), COLLECTION_DAYS - 1)
                      : addDays(dates.pickup ?? first, RETURN_WITHIN)
                  }
                  today={today ?? undefined}
                />
              ) : (
                <div aria-hidden className="h-80 animate-pulse rounded-3xl bg-secondary" />
              )}
            </div>
            {isSameDay(dates) && (
              <p className="mt-2 flex items-start gap-2 rounded-2xl bg-accent px-3 py-2 text-caption font-medium">
                <Sun aria-hidden className="mt-px size-4 shrink-0 text-clay" />
                Same day needs a morning collection. We&apos;ll confirm on WhatsApp.
              </p>
            )}
          </section>

          {/* Where */}
          <section aria-labelledby="where-title">
            <h3 id="where-title" className="flex items-center gap-2 text-body font-semibold">
              <MapPin aria-hidden className="size-5 text-clay" /> Where?
            </h3>
            <div className="mt-3 grid gap-2">
              <AreaPicker id={AREA_ID} value={area} onChange={setArea} />
              <OptionalNote
                value={note}
                onChange={setNote}
                placeholder="Hostel, gate or landmark"
              />
            </div>
          </section>
        </SheetBody>

        <SheetFooter className="grid gap-2.5">
          <div className="flex items-center justify-between gap-3">
            <ul className="flex flex-wrap gap-1.5">
              {["Free pickup", "Free ironing"].map((label) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-caption font-semibold text-success"
                >
                  <Check aria-hidden className="size-3.5" /> {label}
                </li>
              ))}
            </ul>
            <Price amount={total} size="lg" />
          </div>
          {gaps[0] ? (
            <Button type="button" size="lg" block onClick={() => showGap(gaps[0]!)}>
              {gapLabels[gaps[0]]} <ArrowRight aria-hidden />
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
          <OrderSent sent={sentMessage === message} message={message} className="p-3">
            Tap Send in WhatsApp. We&apos;ll confirm the collection time there. Didn&apos;t open?
          </OrderSent>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
