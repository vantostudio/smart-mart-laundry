import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

/*
 * Surface for every boxed block on the site.
 *   default      white card, hairline border, soft shadow
 *   interactive  lifts on hover; pair with asChild + Link
 *   brand        deep green mesh, light text (tokens re-scoped via surface-inverse)
 *   clay         terracotta gradient, for the one thing you want picked
 *   glass        translucent; for cards sitting on a brand band
 *   muted        flat cream panel for notes and asides
 *   ticket       floating receipt with a heavier shadow
 */
const cardVariants = cva("relative flex flex-col overflow-hidden text-card-foreground", {
  variants: {
    variant: {
      default: "border border-border bg-card shadow-card",
      interactive:
        "group border border-border bg-card shadow-card transition-[translate,box-shadow,border-color] duration-300 ease-out-expo hover:-translate-y-1 hover:border-clay/30 hover:shadow-lift",
      brand: "bg-mesh surface-inverse shadow-lift",
      clay: "bg-gradient-clay surface-inverse shadow-glow-clay [--ink:var(--clay-foreground)]",
      glass:
        "group border border-border bg-card backdrop-blur-md transition-colors hover:bg-secondary",
      muted: "bg-secondary/70",
      ticket: "border border-border bg-card shadow-ticket",
    },
    padding: {
      none: "",
      sm: "p-4",
      md: "p-5 sm:p-6",
      lg: "p-6 sm:p-8",
    },
    radius: {
      lg: "rounded-2xl",
      xl: "rounded-3xl",
    },
  },
  defaultVariants: { variant: "default", padding: "md", radius: "lg" },
});

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    /** Render the child (e.g. a Link or article) with card styles. */
    asChild?: boolean;
  };

export function Card({ className, variant, padding, radius, asChild, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      className={cn(cardVariants({ variant, padding, radius }), className)}
      {...props}
    />
  );
}

const aspects = {
  "4/3": "aspect-4/3",
  "4/5": "aspect-4/5",
  "3/4": "aspect-3/4",
} as const;

type CardMediaProps = {
  src: string;
  alt: string;
  sizes: string;
  aspect?: keyof typeof aspects;
  priority?: boolean;
  className?: string;
  /** Overlays placed over the image (badges, captions). */
  children?: React.ReactNode;
};

/** Edge-to-edge image at the top of a `padding="none"` card; zooms when the card is hovered. */
export function CardMedia({
  src,
  alt,
  sizes,
  aspect = "4/3",
  priority,
  className,
  children,
}: CardMediaProps) {
  return (
    <div className={cn("relative overflow-hidden", aspects[aspect], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
      />
      {children}
    </div>
  );
}

export function CardBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-1 flex-col p-4 sm:p-5", className)} {...props} />;
}
