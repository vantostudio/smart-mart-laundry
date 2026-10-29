"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";

import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/features/shop/data";
import { unsplash } from "@/lib/images";
import { cn } from "@/lib/utils";

/** "Size M", "S–XL", "38–44", "Ages 2–8". */
function sizeSummary(sizes: readonly string[]) {
  if (sizes.length === 1) return `Size ${sizes[0]}`;
  const first = sizes[0]!;
  const last = sizes.at(-1)!;
  if (last.endsWith("yrs")) return `Ages ${parseInt(first)}–${last.match(/(\d+) yrs$/)?.[1]}`;
  return `${first}–${last}`;
}

type Props = {
  product: Product;
  /** Some size of this product is in the bag. */
  inBag: boolean;
  /** Open the quick view. */
  onOpen: () => void;
  /** The round + button: adds a single-size item, otherwise opens the quick view to pick one. */
  onQuickAdd: () => void;
  priority?: boolean;
};

/**
 * Catalogue card: photo with its condition, name, brand and colour, price and sizes. The
 * whole card opens the quick view; the + over the photo adds straight to the bag when there's
 * only one size to choose.
 */
export function ProductCard({ product: p, inBag, onOpen, onQuickAdd, priority }: Props) {
  const oneOff = p.condition === "mtumba";

  return (
    <article className="group relative flex min-w-0 flex-col">
      {/* The whole card opens the quick view; the content below sits on top but lets taps through. */}
      <button
        type="button"
        onClick={onOpen}
        aria-label={p.name}
        className="absolute inset-0 rounded-3xl focus-visible:ring-4 focus-visible:ring-ring/35 focus-visible:outline-none"
      />
      <div className="pointer-events-none relative aspect-4/5 overflow-hidden rounded-3xl bg-muted">
        <Image
          src={unsplash(p.images[0]!, 600)}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1152px) 270px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        <Badge variant={oneOff ? "soft" : "chip"} size="sm" className="absolute top-2.5 left-2.5">
          {oneOff ? "Mtumba" : "New"}
        </Badge>
        <Button
          type="button"
          variant={inBag ? "inverse" : "primary"}
          onClick={onQuickAdd}
          aria-label={inBag ? `${p.name} is in your bag, add another size` : `Add ${p.name}`}
          className="pointer-events-auto absolute right-2.5 bottom-2.5 size-11 rounded-full p-0 shadow-lift"
        >
          {inBag ? (
            <Check aria-hidden className="size-5 text-success" />
          ) : (
            <Plus aria-hidden className="size-5" />
          )}
        </Button>
      </div>

      <div className="pointer-events-none relative mt-3 min-w-0 px-1">
        <h3 className="line-clamp-2 text-body font-semibold">{p.name}</h3>
        <p className="truncate text-caption text-muted-foreground">
          {[p.brand, p.colour].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
          <Price amount={p.price} size="sm" />
          <span className={cn("text-caption text-muted-foreground", oneOff && "font-semibold")}>
            {sizeSummary(p.sizes)}
            {oneOff && " · 1 piece"}
          </span>
        </div>
      </div>
    </article>
  );
}
