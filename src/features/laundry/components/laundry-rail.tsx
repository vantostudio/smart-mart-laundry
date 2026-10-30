"use client";

import { LayoutGrid } from "lucide-react";
import Image from "next/image";

import { useCart } from "@/features/cart/cart-provider";
import { laundryCategories, laundryItems, type LaundryCategory } from "@/features/laundry/data";
import { unsplash } from "@/lib/images";
import { cn } from "@/lib/utils";

const categoryOf = new Map(laundryItems.map((i) => [i.id, i.category]));

type Props = {
  value: LaundryCategory | null;
  onChange: (value: LaundryCategory | null) => void;
};

/**
 * Categories as round photo buttons ("All" first), with a count badge once something from
 * that category is in the cart. Scrolls sideways on phones; tap the selected one again for all.
 */
export function LaundryRail({ value, onChange }: Props) {
  const { items } = useCart();
  const countIn = (c: LaundryCategory) =>
    items.reduce((sum, i) => (categoryOf.get(i.id) === c ? sum + i.qty : sum), 0);
  const options = [{ id: null, label: "All", image: null }, ...laundryCategories];

  return (
    <fieldset className="-mx-gutter flex min-w-0 snap-x scroll-px-gutter [scrollbar-width:none] gap-2 overflow-x-auto px-gutter pt-1 pb-2 sm:justify-center sm:gap-4">
      <legend className="sr-only">What needs washing?</legend>
      {options.map((o) => {
        const selected = value === o.id;
        const n = o.id ? countIn(o.id) : 0;
        return (
          <button
            key={o.id ?? "all"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : o.id)}
            className="group flex w-18 shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl py-1 sm:w-22"
          >
            <span
              className={cn(
                "relative flex size-16 items-center justify-center rounded-full bg-secondary ring-offset-2 ring-offset-background transition-[box-shadow,scale] duration-300 ease-out-expo group-active:scale-95 sm:size-18",
                selected ? "ring-3 ring-primary" : "ring-1 ring-border group-hover:ring-primary/40",
              )}
            >
              {o.image ? (
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <Image
                    src={unsplash(o.image, 160)}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </span>
              ) : (
                <LayoutGrid aria-hidden className="size-6 text-primary" />
              )}
              {n > 0 && (
                <span className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-caption font-bold text-primary-foreground figures">
                  {n}
                  <span className="sr-only"> added</span>
                </span>
              )}
            </span>
            <span
              className={cn(
                "text-caption leading-tight",
                selected ? "font-bold text-foreground" : "font-semibold text-muted-foreground",
              )}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
