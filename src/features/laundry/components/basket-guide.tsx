import { ChevronDown, Ruler } from "lucide-react";

import { Price } from "@/components/shared/price";
import { itemsIn } from "@/features/laundry/data";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

const baskets = itemsIn("baskets");
// Relative size only: a quarter step per basket, smallest to biggest.
const fill = ["w-1/4", "w-2/4", "w-3/4", "w-full"] as const;

/** "Which basket do I need?" built from the basket descriptions, collapsed by default. */
export function BasketGuide() {
  return (
    <details className="group rounded-3xl bg-secondary/70">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-3xl px-4 py-2 text-body-sm font-semibold outline-none focus-visible:ring-4 focus-visible:ring-ring/35 sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="flex size-4 shrink-0 items-center justify-center text-clay">
          <Ruler aria-hidden className="size-4" />
        </span>
        <span className="flex-1">Which basket do I need?</span>
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <ul className="grid gap-x-8 gap-y-3 px-4 pt-1 pb-4 sm:px-5 @2xl:grid-cols-2">
        {baskets.map((b, i) => (
          <li key={b.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-body-sm">
                <span className="font-semibold">{b.name}.</span>{" "}
                <span className="text-muted-foreground">{b.desc}</span>
              </p>
              <Price amount={b.price} size="sm" className="shrink-0 text-primary" />
            </div>
            <div aria-hidden className="mt-1.5 h-1 rounded-full bg-border">
              <div className={cn("h-full rounded-full bg-primary", fill[i] ?? "w-full")} />
            </div>
          </li>
        ))}
      </ul>
      <p className="px-4 pb-4 text-caption text-muted-foreground sm:px-5 sm:pb-5">
        Still not sure?{" "}
        <a
          href={waLink("Hi Street Mart, which laundry basket size do I need?")}
          target="_blank"
          rel="noreferrer"
          className="text-link"
        >
          Ask us on WhatsApp
        </a>
        .
      </p>
    </details>
  );
}
