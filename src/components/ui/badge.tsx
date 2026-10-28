import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Small pill for tags, statuses, codes and chips.
 * `chip` is the outlined hero chip; `code` sets ticket numbers in mono.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3.5",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground",
        clay: "bg-clay text-clay-foreground",
        gradient: "bg-gradient-sunset text-clay-foreground shadow-glow-clay",
        soft: "bg-clay-soft text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        chip: "border border-border bg-card/80 text-foreground/85 backdrop-blur-sm",
        inverse: "bg-primary-foreground/12 text-primary-foreground ring-1 ring-primary-foreground/20",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning-foreground",
        info: "bg-info-soft text-info",
        destructive: "bg-destructive-soft text-destructive",
        code: "bg-clay-soft font-mono tracking-wide text-accent-foreground",
      },
      size: {
        sm: "h-6 px-2.5 text-[0.65rem] tracking-wider uppercase",
        md: "h-7 px-3 text-caption",
        lg: "h-9 px-4 text-body-sm",
      },
    },
    defaultVariants: {
      variant: "soft",
      size: "md",
    },
  },
);

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean };

function Badge({ className, variant, size, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "soft"}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants, type BadgeProps };
