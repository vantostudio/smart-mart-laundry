"use client";

import { ToggleChip } from "@/components/shared/toggle-chip";
import { productMessages } from "@/features/admin/messages";
import type { ProductCategory } from "@/lib/db/schema";

import { keepSizes, sizesFor } from "../sizes";

type Props = {
  category: ProductCategory | null;
  sizes: string[];
  onChange: (sizes: string[]) => void;
};

/** Tick the sizes in stock. They save in list order, however they were ticked. */
export function SizePicker({ category, sizes, onChange }: Props) {
  if (!category) {
    return (
      <p className="text-body-sm text-muted-foreground">{productMessages.sizesNeedCategory}</p>
    );
  }
  function toggle(size: string) {
    const next = sizes.includes(size) ? sizes.filter((item) => item !== size) : [...sizes, size];
    onChange(keepSizes(next, category as ProductCategory));
  }
  return (
    <div role="group" aria-label={productMessages.sizes} className="flex flex-wrap gap-2">
      {sizesFor(category).map((size) => (
        <ToggleChip key={size} selected={sizes.includes(size)} onClick={() => toggle(size)}>
          {size}
        </ToggleChip>
      ))}
    </div>
  );
}
