import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

// Copies of the content in a row: enough to fill wide screens while the first one scrolls out.
const REPEAT = 4;

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /** Scroll the other way. */
  reverse?: boolean;
  /** Pause the animation while hovered. */
  pauseOnHover?: boolean;
  children: ReactNode;
}

/** Magic UI Marquee, horizontal only: the content repeats and drifts sideways forever. */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex flex-row gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        className,
      )}
    >
      {Array.from({ length: REPEAT }, (_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 animate-marquee flex-row justify-around gap-(--gap)",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
