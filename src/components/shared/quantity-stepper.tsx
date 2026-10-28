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
  className?: string;
};

export function QuantityStepper({
  value,
  onChange,
  label,
  tone = "default",
  block = false,
  className,
}: Props) {
  const inverse = tone === "inverse";
  const stepClass = cn(
    "flex size-8 items-center justify-center rounded-full transition-[background-color,scale] duration-200 active:scale-90",
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
        className={cn(
          stepClass,
          !inverse &&
            "bg-primary text-primary-foreground inset-shadow-highlight hover:bg-primary hover:shadow-glow-primary",
        )}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
