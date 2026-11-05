"use client";

import { Check, Plus } from "lucide-react";

import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categoryLabels } from "@/features/products/labels";
import type { PublicProduct } from "@/features/products/public";
import { cn } from "@/lib/utils";

import { ProductPhoto } from "./product-photo";

/** "One size", "Size M", "S–XL", "38–44". */
function sizeSummary(sizes: readonly string[]) {
  if (sizes.length === 0) return "One size";
  if (sizes.length === 1) return `Size ${sizes[0]}`;
  return `${sizes[0]}–${sizes.at(-1)}`;
}

type Props = {
  product: PublicProduct;
  /** Some size of this product is in the bag. */
  inBag: boolean;
  /** Open the quick view. */
  onOpen: () => void;
  /** The round + button: adds a single-size item, otherwise opens the quick view to pick one. */
  onQuickAdd: () => void;
  priority?: boolean;
};

/**
 * Catalogue card: photo with its condition, name, category, price and sizes. The whole card opens
 * the quick view; the + over the photo adds straight to the bag when there's no size to choose.
 */
export function ProductCard({ product: p, inBag, onOpen, onQuickAdd, priority }: Props) {
  const mtumba = p.condition === "mtumba";
  const lastOne = p.stock === 1;

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
        <ProductPhoto
          src={p.thumbnail}
          fallback={p.photos[0]}
          priority={priority}
          sizes="(min-width: 1152px) 270px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw"
          className="transition-transform duration-700 ease-out-expo group-hover:scale-105"
        />
        <Badge variant={mtumba ? "soft" : "chip"} size="sm" className="absolute top-2.5 left-2.5">
          {mtumba ? "Mtumba" : "New"}
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
        <p className="truncate text-caption text-muted-foreground">{categoryLabels[p.category]}</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-2">
          <Price amount={p.price} size="sm" />
          <span className={cn("text-caption text-muted-foreground", lastOne && "font-semibold")}>
            {sizeSummary(p.sizes)}
            {lastOne && " · 1 piece"}
          </span>
        </div>
      </div>
    </article>
  );
}

/** The same shape as a card, while products load, so nothing jumps when they arrive. */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden className="flex min-w-0 flex-col">
      <div className="aspect-4/5 animate-pulse rounded-3xl bg-muted" />
      {/* Empty lines in the card's own type sizes, so the heights match. */}
      <div className="mt-3 px-1">
        <p className="w-4/5 animate-pulse rounded-full bg-muted text-body font-semibold">&nbsp;</p>
        <p className="mt-px w-1/2 animate-pulse rounded-full bg-muted text-caption">&nbsp;</p>
        <p className="mt-1 w-1/3 animate-pulse rounded-full bg-muted text-body">&nbsp;</p>
      </div>
    </div>
  );
}
