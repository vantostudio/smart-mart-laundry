"use client";

import type { ReactNode } from "react";

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
import { priceBands, type Filters } from "@/features/shop/lib/filters";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: Filters;
  onChange: (next: Partial<Filters>) => void;
  /** Sizes stocked in the current category. */
  sizes: string[];
  /** Results with the current filters, for the "Show N items" button. */
  resultCount: number;
};

function Toggle({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-11 min-w-11 rounded-full px-4 text-body-sm font-semibold transition-colors",
        selected
          ? "bg-primary text-primary-foreground"
          : "bg-card text-foreground ring-1 ring-border hover:ring-primary/40",
      )}
    >
      {children}
    </button>
  );
}

/** Size and price, applied as you tap; tap a selected chip again to clear it. */
export function FiltersSheet({ open, onOpenChange, filters, onChange, sizes, resultCount }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>Results update as you tap.</SheetDescription>
        </SheetHeader>
        <SheetBody className="grid content-start gap-6 pb-6">
          <fieldset className="min-w-0">
            <legend className="text-body-sm font-semibold">Size</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <Toggle
                  key={s}
                  selected={filters.size === s}
                  onClick={() => onChange({ size: filters.size === s ? null : s })}
                >
                  {s}
                </Toggle>
              ))}
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="text-body-sm font-semibold">Price</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {priceBands.map((b) => (
                <Toggle
                  key={b.id}
                  selected={filters.price === b.id}
                  onClick={() => onChange({ price: filters.price === b.id ? null : b.id })}
                >
                  {b.label}
                </Toggle>
              ))}
            </div>
          </fieldset>
        </SheetBody>
        <SheetFooter className="grid grid-cols-[auto_minmax(0,1fr)] gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => onChange({ size: null, price: null })}
          >
            Clear
          </Button>
          <Button type="button" size="lg" onClick={() => onOpenChange(false)}>
            Show {resultCount} {resultCount === 1 ? "item" : "items"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
