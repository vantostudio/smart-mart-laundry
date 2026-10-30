"use client";

import { Plus } from "lucide-react";

import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useCart } from "@/features/cart/cart-provider";
import type { LaundryItem } from "@/features/laundry/data";
import { cn } from "@/lib/utils";

import { categoryTint, ItemArt } from "./item-art";

/**
 * One laundry item as a picture card: the illustration on its category's tint with the size and
 * a round +, then the name and price. Until it's added the whole card is one "Add" button; after
 * that it shows the count and a − qty + stepper.
 */
export function LaundryCard({ item }: { item: LaundryItem }) {
  const { items, add, setQty } = useCart();
  const qty = items.find((i) => i.id === item.id)?.qty ?? 0;

  const picture = (
    <div className={cn("relative px-3 pt-4 pb-2", categoryTint[item.category])}>
      <ItemArt id={item.id} className="mx-auto max-w-44" />
      {item.mark && (
        <span className="absolute top-2.5 left-2.5 rounded-full bg-card px-2.5 py-0.5 text-caption font-bold figures shadow-card">
          {item.mark}
        </span>
      )}
      {qty > 0 ? (
        <span className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full bg-primary text-caption font-bold text-primary-foreground figures">
          {qty}
        </span>
      ) : (
        <span
          aria-hidden
          className="absolute right-2.5 bottom-2.5 flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow-primary transition-transform duration-200 group-active:scale-90"
        >
          <Plus className="size-5" />
        </span>
      )}
    </div>
  );

  const label = (
    <div className="px-3 pt-2.5 pb-3 text-left">
      <h3 className="text-body-sm leading-tight font-semibold">{item.name}</h3>
      <Price amount={item.price} size="sm" />
    </div>
  );

  const card =
    "flex h-full w-full flex-col overflow-hidden rounded-3xl bg-card shadow-card transition-shadow duration-300 ease-out-expo";

  if (qty === 0) {
    return (
      <button
        type="button"
        aria-label={`Add ${item.name}`}
        onClick={() => add({ id: item.id, name: item.name, price: item.price })}
        className={cn(
          card,
          "group outline-none hover:shadow-lift focus-visible:ring-4 focus-visible:ring-ring/35",
        )}
      >
        {picture}
        {label}
      </button>
    );
  }

  return (
    <article className={cn(card, "ring-2 ring-primary")}>
      {picture}
      {label}
      <QuantityStepper
        label={item.name}
        value={qty}
        onChange={(n) => setQty(item.id, n)}
        className="mx-3 mt-auto mb-3 w-auto justify-between"
      />
    </article>
  );
}
