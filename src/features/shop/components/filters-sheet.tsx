"use client";

import type { ReactNode } from "react";

import { ToggleChip } from "@/components/shared/toggle-chip";
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
                <ToggleChip
                  key={s}
                  selected={filters.size === s}
                  onClick={() => onChange({ size: filters.size === s ? null : s })}
                >
                  {s}
                </ToggleChip>
              ))}
            </div>
          </fieldset>
          <fieldset className="min-w-0">
            <legend className="text-body-sm font-semibold">Price</legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {priceBands.map((b) => (
                <ToggleChip
                  key={b.id}
                  selected={filters.price === b.id}
                  onClick={() => onChange({ price: filters.price === b.id ? null : b.id })}
                >
                  {b.label}
                </ToggleChip>
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
