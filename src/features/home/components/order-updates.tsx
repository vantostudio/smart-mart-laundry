"use client";

import { Bike, MessageSquareText, Shirt, WashingMachine } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { orderUpdates } from "@/features/home/data";
import { cn } from "@/lib/utils";

const icons = [Bike, WashingMachine, Shirt, MessageSquareText];
const VISIBLE = 3;

/**
 * Decorative stack of order updates over the hero photo, like notifications arriving on a phone:
 * a new one slides in on top every few seconds and the oldest drops away. Always moving, also on
 * devices set to reduce motion (a product decision: the site's motion is part of the brand).
 */
export function OrderUpdates({ className }: { className?: string }) {
  // Counts up forever; the update shown is tick modulo the list, and the tick is the React key.
  const [tick, setTick] = useState(VISIBLE - 1);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 2600);
    return () => window.clearInterval(id);
  }, []);

  const shown = Array.from({ length: VISIBLE }, (_, k) => tick - k).filter((t) => t >= 0);

  return (
    <ul aria-hidden className={cn("flex flex-col gap-2", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {shown.map((t, k) => {
          const i = t % orderUpdates.length;
          const update = orderUpdates[i]!;
          const Icon = icons[i] ?? Bike;
          return (
            <motion.li
              key={t}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1 - k * 0.22, y: 0, scale: 1 - k * 0.03 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className={cn(
                "flex items-center gap-3 rounded-2xl bg-card/95 p-2.5 pr-4 shadow-lift backdrop-blur-md",
                // Phones show the two newest; there isn't room for three over a short photo.
                k === 2 && "hidden sm:flex",
              )}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-body-sm font-semibold">{update.status}</span>
                  <span className="shrink-0 text-caption text-muted-foreground">
                    {k === 0 ? "now" : `${k * 3}m`}
                  </span>
                </span>
                <span className="block truncate text-caption text-muted-foreground">
                  {update.detail}
                </span>
              </span>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
