"use client";

import { BedDouble, Footprints, Layers, Shirt, type LucideIcon } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";

import { Price } from "@/components/shared/price";
import { useCart } from "@/features/cart/cart-provider";
import {
  itemsIn,
  laundryCategories,
  laundryItems,
  type LaundryCategory,
} from "@/features/laundry/data";
import { cn } from "@/lib/utils";

import { BasketGuide } from "./basket-guide";
import { LaundryItemRow } from "./laundry-item-row";
import { StepSection } from "./step-section";

type Props = {
  tab: LaundryCategory;
  onTabChange: (tab: LaundryCategory) => void;
  /** Inline message, e.g. when the visitor tries to send an empty order. */
  error?: string;
};

export const ITEMS_HEADING_ID = "items-heading";

const tabIcons: Record<LaundryCategory, LucideIcon> = {
  baskets: Shirt,
  duvets: BedDouble,
  mats: Layers,
  shoes: Footprints,
};

/** Step 2: four tabs of item rows (two to a row once there's room) with the category's price note. */
export function LaundryItems({ tab, onTabChange, error }: Props) {
  const { items, count, total } = useCart();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const categoryOf = new Map(laundryItems.map((i) => [i.id, i.category]));
  const countIn = (c: LaundryCategory) =>
    items.reduce((sum, i) => (categoryOf.get(i.id) === c ? sum + i.qty : sum), 0);

  function onKeyDown(event: KeyboardEvent, index: number) {
    const n = laundryCategories.length;
    const moves: Record<string, number> = {
      ArrowRight: (index + 1) % n,
      ArrowLeft: (index - 1 + n) % n,
      Home: 0,
      End: n - 1,
    };
    const next = moves[event.key];
    if (next === undefined) return;
    event.preventDefault();
    tabRefs.current[next]?.focus();
    onTabChange(laundryCategories[next]!.id);
  }

  return (
    <StepSection
      id="items"
      step={2}
      headingId={ITEMS_HEADING_ID}
      title="What needs washing?"
      intro="Prices include washing, drying and ironing."
      aside={
        count > 0 ? (
          <p className="shrink-0 text-right text-caption text-muted-foreground">
            <span className="figures">
              {count} {count === 1 ? "item" : "items"}
            </span>
            <br />
            <Price amount={total} size="sm" className="text-foreground" />
          </p>
        ) : null
      }
    >
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-2xl bg-destructive-soft px-4 py-2.5 text-body-sm font-semibold text-destructive"
        >
          {error}
        </p>
      )}

      <div
        role="tablist"
        aria-label="Item type"
        className="grid grid-cols-4 gap-1 rounded-full bg-secondary p-1"
      >
        {laundryCategories.map((c, index) => {
          const selected = c.id === tab;
          const n = countIn(c.id);
          const Icon = tabIcons[c.id];
          return (
            <button
              key={c.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`tab-${c.id}`}
              aria-selected={selected}
              aria-controls={`panel-${c.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onTabChange(c.id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cn(
                "relative flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-full px-1 text-body-sm font-semibold outline-none",
                "transition-[background-color,color,box-shadow] duration-200 focus-visible:ring-4 focus-visible:ring-ring/35",
                selected
                  ? "bg-card text-foreground shadow-card"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon
                aria-hidden
                className={cn("hidden size-4 shrink-0 @md:block", selected && "text-clay")}
              />
              <span className="truncate">{c.label}</span>
              {n > 0 && (
                <>
                  {/* A dot on narrow tabs (the label needs the room), the count once there is space. */}
                  <span
                    aria-hidden
                    className="absolute top-2 right-2 size-1.5 rounded-full bg-clay @sm:hidden"
                  />
                  <span
                    aria-hidden
                    className="hidden h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-overline font-bold tracking-normal text-primary-foreground figures @sm:flex"
                  >
                    {n}
                  </span>
                  <span className="sr-only">, {n} added</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {laundryCategories.map((c) => (
        <div
          key={c.id}
          role="tabpanel"
          id={`panel-${c.id}`}
          aria-labelledby={`tab-${c.id}`}
          hidden={c.id !== tab}
          className="mt-3 outline-none"
        >
          <p className="mb-3 px-1 text-caption text-muted-foreground">{c.note}</p>
          <ul className="grid gap-2.5 @3xl:grid-cols-2 @3xl:gap-3">
            {itemsIn(c.id).map((item) => (
              <LaundryItemRow key={item.id} item={item} />
            ))}
          </ul>
          {c.id === "baskets" && (
            <div className="mt-3">
              <BasketGuide />
            </div>
          )}
        </div>
      ))}
    </StepSection>
  );
}
