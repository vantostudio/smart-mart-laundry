"use client";

import { SearchX, Search, SlidersHorizontal, Store, Truck, Wallet, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { PerkList } from "@/components/shared/perk-list";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useBag } from "@/features/cart/cart-provider";
import { useOpenCart } from "@/features/cart/open-cart";
import {
  categoryName,
  productByCode,
  products,
  SHOP_DELIVERY,
  shopCategories,
  type Condition,
  type Product,
  type ShopCategoryId,
} from "@/features/shop/data";
import {
  activeFilterCount,
  emptyFilters,
  filterParams,
  filterProducts,
  parseFilters,
  priceBands,
  sizeOptions,
  sortOptions,
  type Filters,
  type SortId,
} from "@/features/shop/lib/filters";
import { bagLine, bagLineId } from "@/features/shop/lib/shop-message";
import { ksh } from "@/lib/format";

import { BagSheet } from "./bag-sheet";
import { CategoryRail } from "./category-rail";
import { FiltersSheet } from "./filters-sheet";
import { ProductCard } from "./product-card";
import { ProductSheet } from "./product-sheet";
import { ShopBagBar } from "./shop-bag-bar";

export const CATALOGUE_ID = "catalogue";
const PAGE_SIZE = 12;

const perks = [
  { icon: Store, label: "Mtumba & brand new" },
  { icon: Truck, label: `Free delivery over ${ksh(SHOP_DELIVERY.freeFrom)}` },
  { icon: Wallet, label: "Pay on delivery" },
];

const conditionOptions = [
  { value: "all", label: "All" },
  { value: "mtumba", label: "Mtumba" },
  { value: "new", label: "Brand new" },
] as const;

type Params = Pick<URLSearchParams, "get"> | null;

/** Reads search, filters and the open item from the URL. Must sit inside <Suspense>. */
export function ShopCatalogueFromUrl() {
  const searchParams = useSearchParams();
  return <ShopCatalogue params={searchParams} />;
}

/**
 * The shop: search, aisles, condition, more filters (size, price) and sort over the catalogue,
 * with a quick view per item and a bag that sends one WhatsApp order. Everything you narrow by,
 * and the item you're looking at, lives in the URL so a link shows the same thing.
 */
export function ShopCatalogue({ params }: { params: Params }) {
  const { items: bagItems, add } = useBag();
  const [filters, setFilters] = useState<Filters>(() => parseFilters(params));
  const [itemCode, setItemCode] = useState<string | null>(() => params?.get("item") ?? null);
  const [bagOpen, setBagOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [shown, setShown] = useState(PAGE_SIZE);
  // Typing stays instant; the grid catches up a moment later.
  const q = useDeferredValue(filters.q);

  const results = useMemo(() => filterProducts(products, { ...filters, q }), [filters, q]);
  const counts = useMemo(() => {
    const everyAisle = filterProducts(products, { ...filters, q, cat: null });
    return Object.fromEntries(
      shopCategories.map((c) => [c.id, everyAisle.filter((p) => p.category === c.id).length]),
    ) as Record<ShopCategoryId, number>;
  }, [filters, q]);
  const sizes = sizeOptions(products, filters.cat);
  const narrowing = activeFilterCount(filters) + (filters.q.trim() ? 1 : 0);

  // The header's orders button opens the bag here, or links to /shop#bag from other pages.
  useOpenCart("bag", () => setBagOpen(true));

  function writeUrl(f: Filters, item: string | null) {
    const url = new URL(window.location.href);
    const search = new URLSearchParams(filterParams(f));
    if (item) search.set("item", item);
    url.search = search.toString();
    url.hash = "";
    window.history.replaceState(window.history.state, "", url);
  }

  function change(next: Partial<Filters>) {
    const f = { ...filters, ...next };
    // A size from another aisle would hide everything.
    if (f.size && !sizeOptions(products, f.cat).includes(f.size)) f.size = null;
    setFilters(f);
    setShown(PAGE_SIZE);
    writeUrl(f, itemCode);
  }

  function openItem(code: string | null) {
    setItemCode(code);
    writeUrl(filters, code);
  }

  function quickAdd(p: Product) {
    const size = p.sizes.length === 1 ? p.sizes[0]! : null;
    const line = size ? bagItems.find((i) => i.id === bagLineId(p, size)) : undefined;
    if (size && (!line || line.qty < p.stock)) add(bagLine(p, size));
    else openItem(p.code);
  }

  const inBag = (p: Product) => bagItems.some((i) => i.id.startsWith(`${p.code}:`));

  const chips: { key: string; label: string; clear: Partial<Filters> }[] = [
    ...(filters.q.trim() ? [{ key: "q", label: `“${filters.q.trim()}”`, clear: { q: "" } }] : []),
    ...(filters.cat
      ? [{ key: "cat", label: categoryName(filters.cat), clear: { cat: null } }]
      : []),
    ...(filters.cond
      ? [
          {
            key: "cond",
            label: filters.cond === "new" ? "Brand new" : "Mtumba",
            clear: { cond: null },
          },
        ]
      : []),
    ...(filters.size
      ? [{ key: "size", label: `Size ${filters.size}`, clear: { size: null } }]
      : []),
    ...(filters.price
      ? [
          {
            key: "price",
            label: priceBands.find((b) => b.id === filters.price)!.label,
            clear: { price: null },
          },
        ]
      : []),
  ];

  const lookingFor = [filters.q.trim(), filters.size && `in size ${filters.size}`]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <section>
        <div className="container-page pt-8 pb-6 sm:pt-12 sm:pb-8 lg:pt-16">
          <h1 className="display text-display-lg">Clothes &amp; shoes, mtumba and new</h1>
          <p className="mt-3 max-w-reading text-body-lg text-muted-foreground sm:mt-4">
            From our counter at Chuka General and trusted local sellers. Add what you like to your
            bag and order on WhatsApp, or come try it on.
          </p>
          <PerkList perks={perks} className="mt-5" />

          <search className="relative mt-6 max-w-xl sm:mt-8">
            <label htmlFor="shop-search" className="sr-only">
              Search the shop
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="shop-search"
              type="search"
              shape="pill"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Search dresses, sneakers, jeans…"
              value={filters.q}
              onChange={(e) => change({ q: e.target.value })}
              className="h-14 pr-14 pl-12 shadow-card [&::-webkit-search-cancel-button]:hidden"
            />
            {filters.q && (
              <Button
                type="button"
                variant="ghost"
                aria-label="Clear search"
                onClick={() => change({ q: "" })}
                className="absolute top-1/2 right-1.5 size-11 -translate-y-1/2 rounded-full p-0"
              >
                <X aria-hidden className="size-5" />
              </Button>
            )}
          </search>
        </div>
      </section>

      <section
        id={CATALOGUE_ID}
        aria-labelledby="catalogue-heading"
        className="scroll-mt-20 pb-section"
      >
        <div className="container-page">
          <h2 id="catalogue-heading" className="sr-only">
            Catalogue
          </h2>
          <CategoryRail value={filters.cat} onChange={(cat) => change({ cat })} counts={counts} />

          <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <ChoiceChips
              label="Condition"
              columns={3}
              options={conditionOptions}
              value={filters.cond ?? "all"}
              onChange={(v) => change({ cond: v === "all" ? null : (v as Condition) })}
              className="sm:w-80"
            />
            <div className="flex items-center gap-2 sm:ml-auto sm:gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setFiltersOpen(true)}
                className="shrink-0 px-4"
              >
                <SlidersHorizontal aria-hidden /> Filters
                {(filters.size || filters.price) && (
                  <Badge variant="primary" size="sm" className="ml-0.5 size-5 justify-center p-0">
                    {[filters.size, filters.price].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              <label htmlFor="shop-sort" className="sr-only">
                Sort by
              </label>
              <NativeSelect
                id="shop-sort"
                value={filters.sort}
                onChange={(e) => change({ sort: e.target.value as SortId })}
                className="min-w-0 flex-1 sm:w-52 sm:flex-none"
              >
                {sortOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </NativeSelect>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p aria-live="polite" className="mr-1 text-body-sm font-semibold figures">
              {results.length} {results.length === 1 ? "item" : "items"}
            </p>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => change(c.clear)}
                aria-label={`Remove filter ${c.label}`}
                className="inline-flex min-h-9 items-center gap-1 rounded-full bg-secondary py-1 pr-2 pl-3 text-caption font-semibold hover:bg-muted"
              >
                {c.label} <X aria-hidden className="size-3.5" />
              </button>
            ))}
            {narrowing > 1 && (
              <button
                type="button"
                onClick={() => change({ ...emptyFilters, sort: filters.sort })}
                className="min-h-9 px-2 text-caption font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <>
              <ul className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6">
                {results.slice(0, shown).map((p, i) => (
                  <li key={p.id} className="min-w-0">
                    <ProductCard
                      product={p}
                      inBag={inBag(p)}
                      onOpen={() => openItem(p.code)}
                      onQuickAdd={() => quickAdd(p)}
                      priority={i < 4}
                    />
                  </li>
                ))}
              </ul>
              {results.length > shown && (
                <div className="mt-10 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShown((n) => n + PAGE_SIZE)}
                  >
                    Show more ({results.length - shown} left)
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="mt-6 grid justify-items-center gap-3 rounded-3xl bg-card px-5 py-12 text-center shadow-card">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
                <SearchX aria-hidden className="size-6" />
              </span>
              <p className="display text-title">
                {filters.q.trim()
                  ? `Nothing matches “${filters.q.trim()}”`
                  : "Nothing matches these filters"}
              </p>
              <p className="max-w-sm text-body-sm text-muted-foreground">
                New stock lands every week. Tell us what you&apos;re after and we&apos;ll look out
                for it.
              </p>
              <div className="mt-1 flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  onClick={() => change({ ...emptyFilters, sort: filters.sort })}
                >
                  Clear filters
                </Button>
                <WhatsAppButton
                  message={`Hi Street Mart, I'm looking for ${lookingFor || "something specific"}. Do you have it?`}
                  variant="primary"
                  size="lg"
                >
                  Ask us to find it
                </WhatsAppButton>
              </div>
            </div>
          )}
        </div>
      </section>

      <FiltersSheet
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onChange={change}
        sizes={sizes}
        resultCount={results.length}
      />
      <ProductSheet
        product={productByCode(itemCode) ?? null}
        onOpenChange={(open) => !open && openItem(null)}
        onViewBag={() => {
          openItem(null);
          setBagOpen(true);
        }}
      />
      <BagSheet open={bagOpen} onOpenChange={setBagOpen} />
      <ShopBagBar
        hidden={bagOpen || itemCode !== null || filtersOpen}
        onOpen={() => setBagOpen(true)}
      />
    </>
  );
}
