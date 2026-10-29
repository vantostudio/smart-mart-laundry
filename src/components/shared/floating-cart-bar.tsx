import type { ReactNode } from "react";

import { Price } from "@/components/shared/price";
import { cn } from "@/lib/utils";

type Props = {
  show: boolean;
  count: number;
  /** Small line above the total, e.g. "2 items · pay on delivery". */
  caption: string;
  total: number;
  /** The button on the right. */
  action: ReactNode;
  className?: string;
};

/**
 * Floating pill pinned to the bottom of the screen: item count, a caption, the total and one
 * action. Slides away (and leaves the tab order) while `show` is false.
 */
export function FloatingCartBar({ show, count, caption, total, action, className }: Props) {
  return (
    <div
      inert={!show}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-(--z-header) px-gutter pb-[calc(0.75rem+env(safe-area-inset-bottom))]",
        "transition-[translate,visibility,opacity] duration-300 ease-out-expo",
        show ? "visible translate-y-0 opacity-100" : "invisible translate-y-full opacity-0",
        className,
      )}
    >
      <div className="pointer-events-auto mx-auto flex max-w-narrow items-center justify-between gap-3 rounded-full bg-primary p-1.5 pl-2 surface-inverse shadow-lift">
        <p
          className="flex min-w-0 items-center gap-2.5 text-body-sm font-semibold"
          aria-live="polite"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-clay text-clay-foreground figures">
            {count}
          </span>
          <span className="grid min-w-0 leading-tight">
            <span className="truncate text-caption text-muted-foreground">{caption}</span>
            <Price amount={total} size="sm" />
          </span>
        </p>
        {action}
      </div>
    </div>
  );
}
