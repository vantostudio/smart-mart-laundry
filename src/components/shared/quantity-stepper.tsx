import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (next: number) => void;
  /** Item name, used in the button labels ("Add one Duvet"). */
  label: string;
  /** Highest allowed value; the + button disables there (e.g. 1 for a one-off piece). */
  max?: number;
  className?: string;
};

// 32px to look at, 44px to tap: the ::after pads the hit area without changing the layout.
const stepClass =
  "relative flex size-8 items-center justify-center rounded-full transition-[background-color,scale] duration-200 after:absolute after:-inset-1.5 after:content-[''] hover:bg-background active:scale-90";

export function QuantityStepper({ value, onChange, label, max, className }: Props) {
  const atMax = max !== undefined && value >= max;

  return (
    <div
      className={cn(
        "flex w-fit items-center gap-1 rounded-full bg-secondary p-1 ring-1 ring-border",
        className,
      )}
    >
      <button
        type="button"
        aria-label={`Remove one ${label}`}
        onClick={() => onChange(value - 1)}
        className={stepClass}
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-6 text-center text-body-sm font-bold figures" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Add one ${label}`}
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        className={cn(
          stepClass,
          "bg-primary text-primary-foreground inset-shadow-highlight hover:bg-primary hover:shadow-glow-primary disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
