import { Footprints, Layers, Shirt } from "lucide-react";
import type { ReactNode } from "react";

import { laundryItems, type LaundryCategory } from "@/features/laundry/data";
import { cn } from "@/lib/utils";

// Items without a size mark (mats, shoes) show their category instead.
const categoryIcons: Partial<Record<LaundryCategory, ReactNode>> = {
  mats: <Layers />,
  shoes: <Footprints />,
};

type Props = {
  /** A `laundryItems` id; unknown ids (old carts) fall back to a shirt. */
  id: string;
  active?: boolean;
  size?: "sm" | "md";
  className?: string;
};

/** The square size badge for an item: "S", "6×6", or its category icon. Decorative. */
export function ItemMark({ id, active = false, size = "md", className }: Props) {
  const item = laundryItems.find((i) => i.id === id);
  const long = (item?.mark?.length ?? 0) > 3;

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center font-display font-semibold figures transition-colors",
        size === "md" ? "size-12 rounded-xl [&>svg]:size-5" : "size-9 rounded-lg [&>svg]:size-4",
        long || size === "sm" ? "text-caption" : "text-body",
        active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary",
        className,
      )}
    >
      {item?.mark ?? (item && categoryIcons[item.category]) ?? <Shirt />}
    </span>
  );
}
