"use client";

import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { categoryLabels } from "@/features/products/labels";
import type { PublicProduct } from "@/features/products/public";
import { shopMessages } from "@/features/shop/messages";
import { cn } from "@/lib/utils";

import {
  AddToBag,
  ProductHelp,
  ProductOptions,
  ProductSummary,
  useProductChoice,
} from "./product-details";
import { ProductPhoto } from "./product-photo";

/**
 * `/shop/<code>`: the same things the quick view shows (photos, price, condition, sizes, stock,
 * note, Add to bag) as a page of its own, server-rendered so search engines can read it. The quick
 * view in the shop stays what shoppers use while browsing.
 */
export function ProductPage({ product: p }: { product: PublicProduct }) {
  const choice = useProductChoice(p);

  return (
    <article className="container-page pt-6 pb-section sm:pt-8">
      <Button asChild variant="ghost" size="md" className="-ml-3">
        <Link href="/shop">
          <ArrowLeft aria-hidden /> {shopMessages.productPage.back}
        </Link>
      </Button>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <ul aria-label="Photos" className="grid min-w-0 grid-cols-2 gap-3 lg:self-start">
          {(p.photos.length > 0 ? p.photos : [null]).map((photo, i) => (
            <li
              key={photo ?? "none"}
              className={cn(
                "relative aspect-4/5 overflow-hidden rounded-3xl bg-muted",
                i === 0 && "col-span-2",
              )}
            >
              <ProductPhoto
                src={photo}
                alt={i === 0 ? p.name : ""}
                sizes={
                  i === 0 ? "(min-width: 1024px) 560px, 100vw" : "(min-width: 1024px) 280px, 50vw"
                }
                priority={i === 0}
              />
            </li>
          ))}
        </ul>

        <div className="min-w-0">
          <p className="eyebrow">{categoryLabels[p.category]}</p>
          <h1 className="mt-2 display text-display-lg wrap-anywhere">{p.name}</h1>
          <ProductSummary product={p} />
          <ProductOptions product={p} choice={choice} />

          <div aria-live="polite" className="mt-6">
            <AddToBag product={p} choice={choice}>
              <Button asChild variant="secondary" size="lg">
                <Link href="/shop">Keep shopping</Link>
              </Button>
              <Button asChild variant="primary" size="lg">
                <Link href="/shop#bag">
                  <ShoppingBag aria-hidden /> View bag
                </Link>
              </Button>
            </AddToBag>
          </div>

          <ProductHelp product={p} size={choice.size} />
        </div>
      </div>
    </article>
  );
}
