"use client";

import { LayoutGrid } from "lucide-react";
import Image from "next/image";

import { shopCategories, type ShopCategoryId } from "@/features/shop/data";
import { cn } from "@/lib/utils";

type Props = {
  value: ShopCategoryId | null;
  onChange: (value: ShopCategoryId | null) => void;
  /** Items per category for the current search, so empty aisles show as such. */
  counts: Record<ShopCategoryId, number>;
};

/**
 * Aisles as round photo buttons with a label, "All" first. One row that scrolls sideways on
 * phones and spreads out on wider screens. Tapping the selected aisle again shows everything.
 */
export function CategoryRail({ value, onChange, counts }: Props) {
  const options = [
    { id: null, name: "All", image: null },
    ...shopCategories.map((c) => ({ id: c.id, name: c.name, image: c.image })),
  ];

  return (
    <fieldset className="-mx-gutter flex min-w-0 snap-x scroll-px-gutter [scrollbar-width:none] gap-2 overflow-x-auto px-gutter pt-1 pb-2 sm:gap-3 lg:justify-between">
      <legend className="sr-only">Category</legend>
      {options.map((o) => {
        const selected = value === o.id;
        const empty = o.id !== null && counts[o.id] === 0;
        return (
          <button
            key={o.id ?? "all"}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : o.id)}
            className={cn(
              "group flex w-20 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl py-1 text-center sm:w-24",
              empty && !selected && "opacity-50",
            )}
          >
            <span
              className={cn(
                "relative flex size-16 items-center justify-center overflow-hidden rounded-full bg-secondary ring-offset-2 ring-offset-background transition-[box-shadow,scale] duration-300 ease-out-expo group-active:scale-95 sm:size-18",
                selected ? "ring-3 ring-primary" : "ring-1 ring-border group-hover:ring-primary/40",
              )}
            >
              {o.image ? (
                <Image src={o.image} alt="" fill sizes="72px" className="object-cover" />
              ) : (
                <LayoutGrid aria-hidden className="size-6 text-primary" />
              )}
            </span>
            <span
              className={cn(
                "line-clamp-2 text-caption leading-tight",
                selected ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {o.name}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
