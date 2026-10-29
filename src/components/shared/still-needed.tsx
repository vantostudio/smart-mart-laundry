import { ArrowRight, CheckCircle2, Circle } from "lucide-react";

import { cn } from "@/lib/utils";

type Props<T extends string> = {
  /** What's still missing, in page order, with the message to show. */
  missing: readonly (readonly [T, string])[];
  /** How many things the order needs in all, for the progress meter. */
  total: number;
  /** Scroll to and focus the field that needs attention. */
  onFix: (field: T) => void;
  className?: string;
};

/**
 * Progress meter ("2 of 5 done") and a checklist of what's missing, each item a button that jumps
 * to its field. Turns into an "All set" line once nothing is missing.
 */
export function StillNeeded<T extends string>({ missing, total, onFix, className }: Props<T>) {
  const done = total - missing.length;

  if (missing.length === 0) {
    return (
      <p
        className={cn(
          "flex items-center gap-2 rounded-2xl bg-success-soft p-3 text-body-sm font-semibold text-success",
          className,
        )}
      >
        <CheckCircle2 aria-hidden className="size-4 shrink-0" />
        All set. Send it when you&apos;re ready.
      </p>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-body-sm font-semibold">Still needed</p>
        <p className="text-caption text-muted-foreground figures">
          {done} of {total} done
        </p>
      </div>
      <div
        aria-hidden
        className="mt-2 grid gap-1"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-colors duration-500",
              i < done ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
      <ul className="mt-2">
        {missing.map(([field, label]) => (
          <li key={field}>
            <button
              type="button"
              onClick={() => onFix(field)}
              className="group flex min-h-11 w-full items-center gap-2.5 rounded-xl text-left text-body-sm hover:text-primary"
            >
              <Circle aria-hidden className="size-4 shrink-0 text-clay" />
              <span className="flex-1">{label}</span>
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
