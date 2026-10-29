import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const sectionVariants = cva("relative", {
  variants: {
    tone: {
      plain: "",
      muted: "bg-secondary/60",
      glow: "bg-glow",
      brand: "bg-mesh surface-inverse",
    },
    spacing: {
      default: "py-section",
      top: "pt-section",
      bottom: "pb-section",
      none: "",
    },
  },
  defaultVariants: { tone: "plain", spacing: "default" },
});

type SectionProps = React.ComponentProps<"section"> &
  VariantProps<typeof sectionVariants> & {
    /** Classes for the inner page column. */
    containerClassName?: string;
  };

/** A full-width band with the page column inside. Use for every top-level page section. */
export function Section({
  tone,
  spacing,
  className,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn(sectionVariants({ tone, spacing }), className)} {...props}>
      <div className={cn("container-page", containerClassName)}>{children}</div>
    </section>
  );
}

/** The page column on its own, for header, footer and other non-section wrappers. */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("container-page", className)} {...props} />;
}
