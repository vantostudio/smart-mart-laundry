import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const iconBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center font-display font-bold figures",
  {
    variants: {
      tone: {
        soft: "bg-clay-soft text-accent-foreground ring-1 ring-clay/15 ring-inset",
        primary: "bg-gradient-primary text-primary-foreground inset-shadow-highlight",
        sunset: "bg-gradient-sunset text-clay-foreground shadow-glow-clay inset-shadow-highlight",
        glass: "bg-card text-foreground ring-1 ring-border ring-inset",
      },
      size: {
        sm: "size-9 rounded-xl text-body-sm [&_svg]:size-4",
        md: "size-11 rounded-2xl text-body [&_svg]:size-5",
        lg: "size-14 rounded-2xl text-subtitle [&_svg]:size-6",
      },
    },
    defaultVariants: { tone: "soft", size: "md" },
  },
);

type Props = VariantProps<typeof iconBadgeVariants> & {
  icon?: LucideIcon;
  /** Text content instead of an icon, e.g. a step number. */
  children?: React.ReactNode;
  className?: string;
};

/** Rounded-square tile holding an icon or a short number. */
export function IconBadge({ icon: Icon, tone, size, className, children }: Props) {
  return (
    <span className={cn(iconBadgeVariants({ tone, size }), className)}>
      {Icon ? <Icon aria-hidden /> : children}
    </span>
  );
}
