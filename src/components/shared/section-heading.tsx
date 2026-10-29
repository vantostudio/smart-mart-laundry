import type * as React from "react";

type Props = {
  title: React.ReactNode;
  intro?: React.ReactNode;
};

/** Left-aligned h2 + intro. Colours follow the surface, so it works on brand bands too. */
export function SectionHeading({ title, intro }: Props) {
  return (
    <div className="max-w-reading">
      <h2 className="mt-3 display text-display text-foreground">{title}</h2>
      {intro && <p className="mt-4 text-body-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}
