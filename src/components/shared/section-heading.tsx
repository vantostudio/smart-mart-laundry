import type * as React from "react";

import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
};

/** Eyebrow + h2 + intro. Colours follow the surface, so it works on brand bands too. */
export function SectionHeading({ eyebrow, title, intro, align = "center", className }: Props) {
  return (
    <div className={cn("max-w-reading", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 display text-display text-foreground">{title}</h2>
      {intro && <p className="mt-4 text-body-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}
