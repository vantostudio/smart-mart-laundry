import { ImageOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { productMessages } from "@/features/admin/messages";

import { categoryLabels, conditionLabels } from "../labels";
import { editProductHref } from "../lib/links";
import type { Product } from "../lib/products";

/** One product in the list. The whole card opens it for editing. */
export function ProductCard({ product, photoUrl }: { product: Product; photoUrl: string | null }) {
  return (
    <li>
      <Link
        href={editProductHref(product.id)}
        className="flex h-full gap-4 rounded-3xl bg-card p-3 shadow-card transition-shadow hover:shadow-lift focus-visible:ring-4 focus-visible:ring-clay/20 focus-visible:outline-none"
      >
        <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-secondary">
          {photoUrl ? (
            <Image src={photoUrl} alt="" fill sizes="6rem" unoptimized className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ImageOff aria-hidden className="size-6" />
              <span className="sr-only">{productMessages.noPhoto}</span>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-title font-semibold">{product.name}</h2>
          <p className="text-caption text-muted-foreground">{product.code}</p>
          <Price amount={product.price} size="sm" className="mt-1 block" />
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary" size="sm">
              {categoryLabels[product.category]}
            </Badge>
            <Badge variant={product.condition === "mtumba" ? "soft" : "chip"} size="sm">
              {conditionLabels[product.condition]}
            </Badge>
            {product.stock === 0 ? (
              <Badge variant="primary" size="sm">
                {productMessages.outOfStock}
              </Badge>
            ) : (
              <Badge variant="chip" size="sm">
                {productMessages.inStock(product.stock)}
              </Badge>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}
