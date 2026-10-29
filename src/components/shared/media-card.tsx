import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
  /** Illustration or photo (a `fill` image) shown in a soft frame. */
  visual: ReactNode;
  /** Small label above the title, e.g. "Step 2". */
  eyebrow?: ReactNode;
  title: string;
  children: ReactNode;
  /** Pinned to the bottom of the card (perk line, link). */
  footer?: ReactNode;
  /** `accent` gives the one card that matters most a warm highlight. */
  tone?: "card" | "accent";
  className?: string;
};

/*
 * Card with a visual and short copy. Phones: horizontal, a square visual beside the text, so the
 * card stays wide and short (StaggerGrid mirrors every other one). Tablet and up: visual on top.
 */
export function MediaCard({
  visual,
  eyebrow,
  title,
  children,
  footer,
  tone = "card",
  className,
}: Props) {
  return (
    <article
      className={cn(
        "flex h-full items-center gap-4 rounded-3xl p-3 sm:flex-col sm:items-stretch sm:gap-0 sm:pb-5 lg:p-3.5 lg:pb-6",
        tone === "accent" ? "bg-accent" : "bg-card shadow-card",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl xs:size-32 sm:h-40 sm:w-full lg:h-48",
          tone === "accent" ? "bg-card/70" : "bg-secondary/70",
        )}
      >
        {visual}
      </div>
      <div className="flex min-w-0 flex-1 flex-col px-1 py-0.5 sm:self-stretch sm:px-2 sm:pt-4 sm:pb-0">
        {eyebrow && <p className="mb-1.5 caps-label text-clay">{eyebrow}</p>}
        <h3 className="display text-title">{title}</h3>
        <div className="mt-1 text-body-sm text-muted-foreground">{children}</div>
        {footer && <div className="mt-auto pt-3">{footer}</div>}
      </div>
    </article>
  );
}
