import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** A pill that stays pressed. For picking several, or none; `ChoiceChips` is for exactly one. */
export function ToggleChip({
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
