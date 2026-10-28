import { ArrowRight, type LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { Card } from "./card";
import { IconBadge } from "./icon-badge";

type Props = {
  title: string;
  body: string;
  icon?: LucideIcon;
  /** 1-based step: a large "01" numeral beside the icon, or the number itself when there's no icon. */
  step?: number;
  /** Turns the whole card into a link with an arrow footer. */
  href?: Route;
  cta?: string;
  /** Use "glass" on brand (dark) sections. */
  variant?: "default" | "glass";
  className?: string;
};

/** Icon + title + short copy. Promises, how-it-works steps, service pillars. */
export function FeatureCard({
  title,
  body,
  icon,
  step,
  href,
  cta = "Learn more",
  variant = "default",
  className,
}: Props) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        {icon ? (
          <IconBadge icon={icon} tone={variant === "glass" ? "glass" : "soft"} />
        ) : step ? (
          <IconBadge tone="primary">{step}</IconBadge>
        ) : null}
        {icon && step && (
          <span
            aria-hidden
            className="font-display text-display leading-none font-bold text-clay/25 figures"
          >
            {String(step).padStart(2, "0")}
          </span>
        )}
      </div>
      <h3 className={cn("text-subtitle font-semibold", (icon || step) && "mt-5")}>{title}</h3>
      <p className="mt-2 text-body-sm text-muted-foreground">{body}</p>
      {href && (
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-body-sm font-semibold text-primary">
          {cta}
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      )}
    </>
  );

  const cardVariant = variant === "glass" ? "glass" : href ? "interactive" : "default";

  return href ? (
    <Card asChild variant={cardVariant} className={className}>
      <Link href={href}>{content}</Link>
    </Card>
  ) : (
    <Card variant={cardVariant} className={className}>
      {content}
    </Card>
  );
}
