"use client";

import { ArrowRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { FloatingCartBar } from "@/components/shared/floating-cart-bar";
import { Section } from "@/components/shared/section";
import { Button } from "@/components/ui/button";
import { dateParams, parseDates, type BookingDates } from "@/features/booking/schedule";
import { useNow } from "@/features/booking/use-now";
import { useCart } from "@/features/cart/cart-provider";
import { useOpenCart } from "@/features/cart/open-cart";
import { itemsIn, laundryCategories, type LaundryCategory } from "@/features/laundry/data";
import { parseCategory } from "@/features/laundry/lib/tabs";

import { BookingSheet } from "./booking-sheet";
import { LaundryCard } from "./laundry-card";
import { LaundryRail } from "./laundry-rail";

type Params = Pick<URLSearchParams, "get"> | null;

/** Reads the category and dates from the URL. Must sit inside <Suspense> (useSearchParams). */
export function LaundryOrderFromUrl() {
  const searchParams = useSearchParams();
  return <LaundryOrder params={searchParams} />;
}

const grid = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

/**
 * Laundry, shop style: pick a category, tap the pictures to add items, then "Book pickup" opens
 * the sheet with the dates and area. The category and dates live in the URL
 * (`?cat=mats&pickup=…&back=…`), so a link opens the same view. `params` is null in the
 * Suspense fallback (static prerender), which shows everything.
 */
export function LaundryOrder({ params }: { params: Params }) {
  const nowMs = useNow();
  const now = nowMs === null ? null : new Date(nowMs);
  const { count, total } = useCart();

  const [category, setCategory] = useState(() => parseCategory(params?.get("cat")));
  // The customer's own choices win over the URL once they start picking days.
  const [draftDates, setDraftDates] = useState<BookingDates | null>(null);
  const dates = draftDates ?? (now ? parseDates(params, now) : { pickup: null, back: null });
  const [sheetOpen, setSheetOpen] = useState(false);

  // The header's orders button opens the sheet here, or links to /laundry#cart from other pages.
  useOpenCart("laundry", () => setSheetOpen(true));

  function writeUrl(nextCategory: LaundryCategory | null, nextDates: BookingDates) {
    const search = new URLSearchParams(dateParams(nextDates));
    if (nextCategory) search.set("cat", nextCategory);
    const url = new URL(window.location.href);
    url.search = search.toString();
    url.hash = "";
    window.history.replaceState(window.history.state, "", url);
  }

  function changeCategory(next: LaundryCategory | null) {
    setCategory(next);
    writeUrl(next, dates);
  }

  function changeDates(next: BookingDates) {
    setDraftDates(next);
    writeUrl(category, next);
  }

  const shown = category ? laundryCategories.filter((c) => c.id === category) : laundryCategories;

  return (
    <Section spacing="bottom">
      <LaundryRail value={category} onChange={changeCategory} />

      <div className="mt-6 grid gap-10">
        {shown.map((c) => (
          <section key={c.id} aria-labelledby={`cat-${c.id}`}>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 id={`cat-${c.id}`} className="display text-title">
                {c.label}
              </h2>
              <p className="text-caption font-medium text-muted-foreground">{c.note}</p>
            </div>
            <ul className={grid}>
              {itemsIn(c.id).map((item) => (
                <li key={item.id} className="min-w-0">
                  <LaundryCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <FloatingCartBar
        show={count > 0 && !sheetOpen}
        count={count}
        caption="Pay on delivery"
        total={total}
        action={
          <Button type="button" variant="inverse" onClick={() => setSheetOpen(true)}>
            Book pickup <ArrowRight aria-hidden />
          </Button>
        }
      />

      <BookingSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        dates={dates}
        onDatesChange={changeDates}
        now={now}
      />
    </Section>
  );
}
