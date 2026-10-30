import { ArrowRight, Shirt } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Price } from "@/components/shared/price";
import { Badge } from "@/components/ui/badge";
import { products } from "@/features/shop/data";
import { emptyFilters, filterProducts } from "@/features/shop/lib/filters";
import { unsplash } from "@/lib/images";

// Newest first, the same order as the shop opens with.
const newest = filterProducts(products, emptyFilters).slice(0, 8);

/**
 * The shop right under the hero, so nobody has to scroll to the end to find it: a swipeable row
 * of the newest pieces (photo, condition, name, price). Each opens its quick view on /shop; the
 * last tile goes to the whole shop.
 */
export function ShopRail() {
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
          {newest.map((p, i) => (
            <li key={p.id} className="w-[40%] shrink-0 snap-start xs:w-[30%] sm:w-[23%] lg:w-[17%]">
              <Link
                href={`/shop?item=${p.code}`}
                className="group block rounded-3xl outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-muted">
                  <Image
                    src={unsplash(p.images[0]!, 500)}
                    alt=""
                    fill
                    priority={i < 3}
                    sizes="(min-width: 1024px) 17vw, (min-width: 640px) 23vw, 40vw"
                    className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
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
          <li className="w-[40%] shrink-0 snap-start xs:w-[30%] sm:w-[23%] lg:w-[17%]">
            <Link
              href="/shop"
              className="flex aspect-4/5 flex-col items-center justify-center gap-3 rounded-3xl bg-mesh p-4 text-center surface-inverse outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-card">
                <Shirt aria-hidden className="size-6" />
              </span>
              <span className="text-body-sm font-semibold">
                Browse all {products.length} pieces
              </span>
              <ArrowRight aria-hidden className="size-5" />
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
