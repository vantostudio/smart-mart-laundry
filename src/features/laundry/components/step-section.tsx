import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  id: string;
  step: number;
  /** Id of the h2, so the order summary's checklist can move focus to it. */
  headingId: string;
  title: string;
  intro?: ReactNode;
  /** Right side of the heading row, e.g. an item count. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** One step of the order: a number badge and a single heading, then the step's content. */
export function StepSection({
  id,
  step,
  headingId,
  title,
  intro,
  aside,
  children,
  className,
}: Props) {
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("@container min-w-0 scroll-mt-20", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-body-sm font-semibold text-primary-foreground figures"
          >
            {step}
          </span>
          <div className="min-w-0">
            <h2 id={headingId} tabIndex={-1} className="display text-title outline-none">
              <span className="sr-only">Step {step}: </span>
              {title}
            </h2>
            {intro && <p className="mt-0.5 text-body-sm text-muted-foreground">{intro}</p>}
          </div>
        </div>
        {aside}
      </div>
      <div className="mt-4 sm:mt-5">{children}</div>
    </section>
  );
}
