"use client";

import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// Copies of the content in a row: enough to fill wide screens while the first one scrolls out.
const REPEAT = 4;
// After a swipe or drag, the row picks up drifting again once it has been left alone this long.
const RESUME_AFTER = 2500;

interface MarqueeProps extends ComponentPropsWithoutRef<"div"> {
  /** Scroll the other way. */
  reverse?: boolean;
  /** Pause the animation while hovered. */
  pauseOnHover?: boolean;
  children: ReactNode;
}

/**
 * Magic UI Marquee, horizontal only: the content repeats and drifts sideways forever. The row is
 * also a scroll area, so it can be swiped or dragged by hand (it pauses while you do, and starts
 * one copy in so there's room both ways); it never just sits there stuck.
 */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  ...props
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const resume = useRef<number | undefined>(undefined);
  // The start position is set from code; that scroll event isn't the visitor.
  const placing = useRef(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const row = ref.current;
    const copy = row?.firstElementChild as HTMLElement | null;
    if (row && copy) {
      placing.current = true;
      row.scrollLeft = copy.offsetWidth;
    }
    return () => window.clearTimeout(resume.current);
  }, []);

  // Hold still while the visitor is touching or scrolling the row, then drift on again.
  const hold = () => {
    setPaused(true);
    window.clearTimeout(resume.current);
    resume.current = window.setTimeout(() => setPaused(false), RESUME_AFTER);
  };

  return (
    <div
      {...props}
      ref={ref}
      onPointerDown={hold}
      onWheel={(e) => e.deltaX !== 0 && hold()}
      onScroll={() => {
        if (placing.current) placing.current = false;
        else hold();
      }}
      className={cn(
        "group flex flex-row gap-(--gap) overflow-x-auto overscroll-x-contain p-2 [--duration:40s] [--gap:1rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {Array.from({ length: REPEAT }, (_, i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 animate-marquee flex-row justify-around gap-(--gap)",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            paused && "[animation-play-state:paused]",
            reverse && "[animation-direction:reverse]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
