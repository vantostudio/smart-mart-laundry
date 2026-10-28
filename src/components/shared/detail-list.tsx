import type * as React from "react";

import { cn } from "@/lib/utils";

type Props = {
  items: readonly (readonly [label: string, value: React.ReactNode])[];
  /** Two columns from the sm breakpoint. */
  columns?: 1 | 2;
  className?: string;
};

/** Label / value rows with dashed rules, like a receipt. */
export function DetailList({ items, columns = 1, className }: Props) {
  return (
    <dl className={cn("grid text-body-sm", columns === 2 && "gap-x-8 sm:grid-cols-2", className)}>
      {items.map(([label, value]) => (
        <div
          key={label}
          className="flex justify-between gap-4 border-b border-dashed border-border py-2 last:border-0"
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
