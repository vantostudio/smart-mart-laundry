import { Children, isValidElement, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const lgColumns = { 2: "", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" } as const;

type Props = Omit<ComponentProps<"ul">, "children"> & {
  children: ReactNode;
  /** Columns from lg up; tablets use two. */
  cols?: keyof typeof lgColumns;
  /**
   * Phones (< 640px):
   *   "stack"   one full-width card per row; every other card mirrors (its first child swaps
   *             sides), so a horizontal card keeps the zig-zag without getting thin
   *   "columns" two staggered columns, for photo tiles that work small
   */
  phone?: "stack" | "columns";
};

/**
 * A grid whose columns sit at different heights ("one card up, the next one down"), so a set of
 * cards reads as a composition rather than a table. Tablets: two columns with the right one
 * dropped. lg: the middle column drops (3 columns) or every other one (2 and 4 columns). Offsets
 * are transforms, so rows keep equal heights; the bottom padding makes room for the drop.
 */
export function StaggerGrid({ children, cols = 3, phone = "stack", className, ...props }: Props) {
  const items = Children.toArray(children);
  const stack = phone === "stack";

  return (
    <ul
      className={cn(
        "grid gap-3 sm:grid-cols-2 sm:gap-4 sm:pb-12 lg:gap-6 lg:pb-16",
        stack ? "grid-cols-1 max-sm:[&>li:nth-child(even)>*]:flex-row-reverse" : "grid-cols-2 pb-8",
        lgColumns[cols],
        className,
      )}
      {...props}
    >
      {items.map((child, i) => {
        const dropOnLg = cols === 3 ? i % 3 === 1 : i % 2 === 1;
        return (
          <li
            key={isValidElement(child) && child.key !== null ? child.key : i}
            className={cn(
              "min-w-0",
              i % 2 === 1 && (stack ? "sm:translate-y-12" : "translate-y-8 sm:translate-y-12"),
              cols !== 2 && (dropOnLg ? "lg:translate-y-16" : "lg:translate-y-0"),
            )}
          >
            {child}
          </li>
        );
      })}
    </ul>
  );
}
