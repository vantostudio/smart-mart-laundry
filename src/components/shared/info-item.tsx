import type { LucideIcon } from "lucide-react";
import type * as React from "react";

type Props = {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
};

/** Icon + bold title + detail, as an <li>. Location, hours and contact lists. */
export function InfoItem({ icon: Icon, title, children }: Props) {
  return (
    <li className="flex items-start gap-4">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-clay-soft text-accent-foreground ring-1 ring-clay/15 ring-inset">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <div className="mt-0.5 text-body-sm text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}
