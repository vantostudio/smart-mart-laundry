"use client";

import { Plus } from "lucide-react";

import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import type { LaundryItem } from "@/features/laundry/data";
import { cn } from "@/lib/utils";

import { ItemMark } from "./item-mark";

/**
 * One item: a size badge ("S", "6×6") or category icon, name, one line, price, and a round +
 * button that turns into a − qty + stepper once the item is in the order.
 */
export function LaundryItemRow({ item }: { item: LaundryItem }) {
  const { items, add, setQty } = useCart();
  const inCart = items.find((i) => i.id === item.id);

  return (
    <li
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-2xl p-3 transition-[background-color,box-shadow] duration-300 ease-out-expo sm:gap-4",
        inCart ? "bg-success-soft ring-1 ring-primary/20" : "bg-card shadow-card",
      )}
    >
      <ItemMark id={item.id} active={Boolean(inCart)} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-body font-semibold">{item.name}</h3>
          {item.tag && (
            <Badge variant="soft" size="sm" className="shrink-0">
              {item.tag}
            </Badge>
          )}
        </div>
        <p className="line-clamp-2 text-body-sm text-muted-foreground">{item.desc}</p>
        <Price amount={item.price} size="sm" className="text-foreground" />
      </div>

      {inCart ? (
        <QuantityStepper
          label={item.name}
          value={inCart.qty}
          onChange={(qty) => setQty(item.id, qty)}
          className="shrink-0 bg-card"
        />
      ) : (
        <Button
          type="button"
          variant="primary"
          aria-label={`Add ${item.name}`}
          onClick={() => add({ id: item.id, name: item.name, price: item.price })}
          className="size-11 shrink-0 rounded-full p-0"
        >
          <Plus aria-hidden className="size-5" />
        </Button>
      )}
    </li>
  );
}
