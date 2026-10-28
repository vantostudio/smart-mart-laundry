import type * as React from "react";

import { Card } from "./card";

type Props = {
  eyebrow?: string;
  title: string;
  body: string;
  actions: React.ReactNode;
  footnote?: string;
};

/** Big closing call-to-action on the brand mesh, with decorative rings. */
export function CtaBanner({ eyebrow, title, body, actions, footnote }: Props) {
  return (
    <Card variant="brand" radius="xl" padding="none" className="isolate text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <span className="absolute -top-24 -right-16 size-72 rounded-full border border-border" />
        <span className="absolute -top-10 -right-2 size-44 rounded-full border border-border" />
        <span className="absolute -bottom-28 -left-20 size-80 rounded-full border border-border" />
      </div>
      <div className="mx-auto max-w-reading px-6 py-14 sm:px-12 sm:py-20">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 display text-display-lg">{title}</h2>
        <p className="mx-auto mt-4 max-w-narrow text-body text-muted-foreground">{body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">{actions}</div>
        {footnote && <p className="mt-6 text-caption text-muted-foreground">{footnote}</p>}
      </div>
    </Card>
  );
}
