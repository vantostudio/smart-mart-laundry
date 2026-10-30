"use client";

import type { LucideIcon } from "lucide-react";
import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type ChoiceChipOption<T extends string> = {
  value: T;
  /** Main line, e.g. "Morning", or the date number "29" in the `date` variant. */
  label: ReactNode;
  /** Optional second line, e.g. "7–10 AM" or "Today". */
  sublabel?: ReactNode;
  /** Small caps line above the label (`date` variant), e.g. "Thu". */
  overline?: ReactNode;
  /** Icon shown with the label (`tile` and `chip` variants). */
  icon?: LucideIcon;
  /** Full name read by screen readers when the visible text is abbreviated. */
  srLabel?: string;
};

type Props<T extends string> = {
  /** Accessible name of the group. */
  label: string;
  options: readonly ChoiceChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  /**
   * `chip`: centred one- or two-line chip (icon on top when given).
   * `date`: calendar tile, weekday / big date / note.
   * `tile`: icon bubble beside a label and detail, left aligned.
   */
  variant?: "chip" | "date" | "tile";
  /**
   * `grid`: equal columns (`columns`).
   * `rail`: one row that scrolls sideways while its container is narrow and becomes equal
   * columns once the nearest `@container` is 24rem wide. Pass matching negative margin and
   * padding via `className` (e.g. `-mx-4 px-4 scroll-px-4`) to bleed to the card edge.
   */
  layout?: "grid" | "rail";
  columns?: 2 | 3 | 4;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

const columnClass = { 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" } as const;

/**
 * Single-choice chip group (WAI-ARIA radio group): one tab stop, arrow keys move and select.
 */
export function ChoiceChips<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = "chip",
  layout = "grid",
  columns = 2,
  className,
  ...aria
}: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const tabStop = Math.max(selectedIndex, 0);

  function move(from: number, key: string) {
    const n = options.length;
    let next: number;
    if (key === "Home") next = 0;
    else if (key === "End") next = n - 1;
    else if (key === "ArrowRight" || key === "ArrowDown") next = (from + 1) % n;
    else next = (from - 1 + n) % n;
    refs.current[next]?.focus();
    refs.current[next]?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    onChange(options[next]!.value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      move(index, event.key);
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      {...aria}
      className={cn(
        layout === "rail"
          ? [
              // Inline-size containment: the row never widens its parent, whatever the grid.
              "flex snap-x snap-mandatory gap-1.5 overflow-x-auto overscroll-x-contain py-1 contain-inline-size",
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
              "@sm:grid @sm:auto-cols-fr @sm:grid-flow-col @sm:overflow-visible",
            ]
          : cn("grid gap-2", columnClass[columns]),
        className,
      )}
    >
      {options.map((option, index) => {
        const checked = index === selectedIndex;
        const Icon = option.icon;
        const muted = checked ? "text-primary-foreground/85" : "text-muted-foreground";

        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            // A native radio can't show multi-line chip content; this follows the ARIA radio pattern.
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
            role="radio"
            aria-checked={checked}
            tabIndex={index === tabStop ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              "group/chip relative min-w-0 rounded-xl border leading-tight outline-none select-none",
              "transition-[background-color,border-color,color,scale] duration-200 ease-out-expo",
              "focus-visible:ring-4 focus-visible:ring-ring/35",
              variant === "tile"
                ? "flex min-h-12 items-center gap-2 px-3 py-2 text-left @xs:gap-2.5"
                : "flex min-h-11 flex-col items-center justify-center px-1 py-1.5 text-center",
              variant === "date" && "min-h-15",
              layout === "rail" && "w-15 shrink-0 snap-start @sm:w-auto",
              checked
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-secondary/50 active:scale-[0.97]",
            )}
          >
            {option.srLabel && <span className="sr-only">{option.srLabel}</span>}
            <span aria-hidden={option.srLabel ? true : undefined} className="contents">
              {variant === "tile" && Icon && (
                <span
                  className={cn(
                    // A bare icon: a bubble would take room the label and time can't spare.
                    "flex shrink-0 items-center justify-center transition-colors [&_svg]:size-4",
                    checked ? "text-primary-foreground" : "text-clay",
                  )}
                >
                  <Icon aria-hidden />
                </span>
              )}
              {variant === "chip" && Icon && (
                <Icon
                  aria-hidden
                  className={cn("mb-1 size-4", checked ? "text-primary-foreground" : "text-clay")}
                />
              )}
              {variant === "date" && option.overline && (
                <span className={cn("text-caption font-medium", muted)}>{option.overline}</span>
              )}

              {variant === "tile" ? (
                <span className="grid min-w-0">
                  <span className="truncate text-body-sm font-semibold">{option.label}</span>
                  {option.sublabel && (
                    <span className={cn("mt-0.5 truncate text-caption font-medium figures", muted)}>
                      {option.sublabel}
                    </span>
                  )}
                </span>
              ) : (
                <>
                  <span
                    className={cn(
                      "whitespace-nowrap",
                      variant === "date"
                        ? "mt-0.5 display text-subtitle figures"
                        : "text-body-sm font-semibold",
                    )}
                  >
                    {option.label}
                  </span>
                  {option.sublabel && (
                    <span
                      className={cn(
                        "mt-0.5 text-caption font-medium whitespace-nowrap figures",
                        muted,
                      )}
                    >
                      {option.sublabel}
                    </span>
                  )}
                </>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
