import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  perks: readonly { icon: LucideIcon; label: string }[];
  className?: string;
};

/** Row of white pills with an icon each, under a page heading ("Free ironing", "Pay on delivery"). */
export function PerkList({ perks, className }: Props) {
  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {perks.map(({ icon: Icon, label }) => (
        <li
          key={label}
          className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-body-sm font-medium shadow-card"
        >
          <Icon aria-hidden className="size-4 text-clay" /> {label}
        </li>
      ))}
    </ul>
  );
}
