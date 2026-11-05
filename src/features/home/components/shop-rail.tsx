"use client";

import { ArrowRight, Shirt } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import type { PublicProductPage } from "@/features/products/public";
import { ProductPhoto } from "@/features/shop/components/product-photo";
import { fetchProducts, productsUrl } from "@/features/shop/lib/api-client";
import { emptyFilters } from "@/features/shop/lib/filters";

const RAIL_SIZE = 8;
const tileClass = "w-[40%] shrink-0 snap-start xs:w-[30%] sm:w-[23%] lg:w-[17%]";

/**
 * The shop right under the hero, so nobody has to scroll to the end to find it: a swipeable row
 * of the newest pieces (photo, condition, name, price). Each opens its quick view on /shop; the
 * last tile goes to the whole shop. It's a teaser, so with nothing to show it just isn't there.
 */
export function ShopRail() {
  const [page, setPage] = useState<PublicProductPage | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const request = new AbortController();
    void fetchProducts(productsUrl(emptyFilters, 1, RAIL_SIZE), request.signal).then((result) => {
      if (request.signal.aborted) return;
      if (result.ok && result.data.items.length > 0) setPage(result.data);
      else setHidden(true);
    });
    return () => request.abort();
  }, []);

  if (hidden) return null;

  return (
    <section aria-labelledby="shop-rail-title" className="border-y border-border/60 py-8 sm:py-10">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="caps-label text-clay">Also from Street Mart</p>
            <h2 id="shop-rail-title" className="mt-1 display text-title">
              New at the shop
            </h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex min-h-11 shrink-0 items-center gap-1 text-body-sm font-semibold text-primary hover:underline"
          >
            See all <ArrowRight aria-hidden className="size-4" />
          </Link>
        </div>

        <ul className="-mx-gutter mt-4 flex snap-x snap-mandatory scroll-px-gutter [scrollbar-width:none] gap-3 overflow-x-auto px-gutter pb-2 sm:gap-4 [&::-webkit-scrollbar]:hidden">
          {page ? (
            <>
              {page.items.map((p, i) => (
                <li key={p.code} className={tileClass}>
                  <Link
                    href={`/shop?item=${p.code}`}
                    className="group block rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
                  >
                    <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted">
                      <ProductPhoto
                        src={p.photos[0]}
                        priority={i < 3}
                        sizes="(min-width: 1024px) 17vw, (min-width: 640px) 23vw, 40vw"
                        className="transition-transform duration-700 ease-out-expo group-hover:scale-105"
                      />
                      <Badge
                        variant={p.condition === "mtumba" ? "soft" : "chip"}
                        size="sm"
                        className="absolute top-2 left-2"
                      >
                        {p.condition === "mtumba" ? "Mtumba" : "New"}
                      </Badge>
                    </div>
                    <p className="mt-2 truncate px-0.5 text-body-sm font-semibold">{p.name}</p>
                    <Price amount={p.price} size="sm" className="px-0.5" />
                  </Link>
                </li>
              ))}
              <li className={tileClass}>
                <Link
                  href="/shop"
                  className="flex aspect-4/5 flex-col items-center justify-center gap-3 rounded-3xl bg-mesh p-4 text-center surface-inverse outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
                >
                  <span className="flex size-12 items-center justify-center rounded-full bg-card">
                    <Shirt aria-hidden className="size-6" />
                  </span>
                  <span className="text-body-sm font-semibold">
                    Browse all {page.total} {page.total === 1 ? "piece" : "pieces"}
                  </span>
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              </li>
            </>
          ) : (
            Array.from({ length: 6 }, (_, i) => (
              <li key={i} aria-hidden className={tileClass}>
                <div className="aspect-4/5 animate-pulse rounded-3xl bg-muted" />
                <div className="mt-2 h-4 w-4/5 animate-pulse rounded-full bg-muted" />
                <div className="mt-2 h-4 w-1/2 animate-pulse rounded-full bg-muted" />
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  );
}
