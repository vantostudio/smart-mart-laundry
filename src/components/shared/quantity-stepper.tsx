import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (next: number) => void;
  /** Item name, used in the button labels ("Add one Duvet"). */
  label: string;
  /** "inverse" for bottle-green panels. */
  tone?: "default" | "inverse";
  /** Stretch to the container width, buttons at the ends. */
  block?: boolean;
  /** Highest allowed value; the + button disables there (e.g. 1 for a one-off piece). */
  max?: number;
  className?: string;
};

export function QuantityStepper({
  value,
  onChange,
  label,
  tone = "default",
  block = false,
  max,
  className,
}: Props) {
  const atMax = max !== undefined && value >= max;
  const inverse = tone === "inverse";
  // 32px to look at, 44px to tap: the ::after pads the hit area without changing the layout.
  const stepClass = cn(
    "relative flex size-8 items-center justify-center rounded-full transition-[background-color,scale] duration-200 after:absolute after:-inset-1.5 after:content-[''] active:scale-90",
    inverse ? "hover:bg-primary-foreground/12" : "hover:bg-background",
  );

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full p-1",
        inverse ? "ring-1 ring-primary-foreground/25" : "bg-secondary ring-1 ring-border",
        block ? "justify-between" : "w-fit",
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
          "disabled:pointer-events-none disabled:opacity-40",
          !inverse &&
            "bg-primary text-primary-foreground inset-shadow-highlight hover:bg-primary hover:shadow-glow-primary",
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
