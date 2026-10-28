import { ksh } from "@/lib/format";
import { cn } from "@/lib/utils";

const sizes = {
  sm: "text-body",
  md: "text-subtitle",
  lg: "text-title",
  xl: "text-display",
} as const;

type Props = {
  amount: number;
  /** e.g. "month" renders "/ month" after the figure. */
  period?: string;
  size?: keyof typeof sizes;
  className?: string;
};

/** Kenyan-shilling amount in the display face with tabular figures. Inherits colour. */
export function Price({ amount, period, size = "md", className }: Props) {
  return (
    <span className={cn("font-display font-bold tracking-tight figures", sizes[size], className)}>
      {ksh(amount)}
      {period && (
        <span className="ml-1 font-sans text-caption font-medium tracking-normal opacity-70">
          / {period}
        </span>
      )}
    </span>
  );
}
