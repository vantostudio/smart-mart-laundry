import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Street Mart button. Pill-shaped by default, generous touch targets.
 *
 * Solid:     primary · clay · secondary · inverse (on dark bands)
 * Gradient:  gradient-primary · gradient-clay (with hover sheen)
 * Quiet:     outline · outline-inverse · soft · ghost
 */
const buttonVariants = cva(
  [
    "group/button relative inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none",
    "transition-[transform,box-shadow,background-color,color,border-color,opacity] duration-200 ease-out-expo",
    "outline-none focus-visible:ring-4 focus-visible:ring-ring/35",
    "active:not-aria-disabled:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground inset-shadow-highlight hover:-translate-y-px hover:shadow-glow-primary",
        clay: "bg-clay text-clay-foreground inset-shadow-highlight hover:-translate-y-px hover:shadow-glow-clay",
        secondary: "bg-secondary text-secondary-foreground hover:bg-muted",
        inverse:
          "bg-primary-foreground text-primary shadow-card hover:-translate-y-px hover:shadow-lift",
        "gradient-primary":
          "sheen bg-gradient-primary text-primary-foreground inset-shadow-highlight hover:-translate-y-px hover:shadow-glow-primary",
        "gradient-clay":
          "sheen bg-gradient-clay text-clay-foreground inset-shadow-highlight hover:-translate-y-px hover:shadow-glow-clay",
        outline:
          "border border-foreground/15 bg-card/60 text-foreground backdrop-blur-sm hover:border-primary/40 hover:bg-card",
        "outline-inverse":
          "border border-primary-foreground/30 text-primary-foreground hover:border-primary-foreground/60 hover:bg-primary-foreground/10",
        soft: "bg-clay-soft text-accent-foreground hover:bg-clay hover:text-clay-foreground",
        ghost: "text-foreground hover:bg-secondary",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-7 text-base",
        xl: "h-14 px-9 text-base [&_svg:not([class*='size-'])]:size-5",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (a `Link` or `<a>`) with button styles. */
    asChild?: boolean;
  };

function Button({ className, variant, size, block, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "primary"}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
