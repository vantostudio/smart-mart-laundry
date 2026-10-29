import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  title: ReactNode;
  intro?: ReactNode;
  /** A link or button under the intro (right column on desktop). */
  action?: ReactNode;
  className?: string;
};

/** Home section header: heading on the left, intro (and action) on the right from lg up. */
export function SectionIntro({ title, intro, action, className }: Props) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16",
        className,
      )}
    >
      <h2 className="max-w-xl display text-display">{title}</h2>
      {(intro || action) && (
        <div className="max-w-md">
          {intro && <p className="text-body-lg text-muted-foreground">{intro}</p>}
          {action && <div className="mt-4">{action}</div>}
        </div>
      )}
    </div>
  );
}
