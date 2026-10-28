import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { IconBadge } from "./icon-badge";

type Props = {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
};

/** Icon + bold title + detail, as an <li>. Location, hours and contact lists. */
export function InfoItem({ icon, title, children }: Props) {
  return (
    <li className="flex items-start gap-4">
      <IconBadge icon={icon} size="sm" />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        <div className="mt-0.5 text-body-sm text-muted-foreground">{children}</div>
      </div>
    </li>
  );
}
