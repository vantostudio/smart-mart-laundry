"use client";

import {
  PackageOpen,
  Search,
  SearchX,
  SlidersHorizontal,
  Store,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { PerkList } from "@/components/shared/perk-list";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useBag } from "@/features/cart/cart-provider";
import { useOpenCart } from "@/features/cart/open-cart";
import { categoryLabels } from "@/features/products/labels";
import { priceBands, type PublicProduct, type SortId } from "@/features/products/public";
import { sizeChoices } from "@/features/products/sizes";
import { useShopSettings } from "@/features/settings/shop-settings-provider";
import {
  activeFilterCount,
  emptyFilters,
  filterParams,
  parseFilters,
  sortOptions,
  type Filters,
} from "@/features/shop/lib/filters";
import { bagLine, bagLineId } from "@/features/shop/lib/shop-message";
import { PAGE_SIZE, useProduct, useProducts } from "@/features/shop/lib/use-products";
import { shopMessages, type LoadProblem } from "@/features/shop/messages";
import type { ProductCondition } from "@/lib/db/schema";
import { ksh } from "@/lib/format";

import { BagSheet } from "./bag-sheet";
import { CategoryRail } from "./category-rail";
import { FiltersSheet } from "./filters-sheet";
import { LoadProblemNotice } from "./load-problem";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { ProductSheet } from "./product-sheet";
import { ShopBagBar } from "./shop-bag-bar";

export const CATALOGUE_ID = "catalogue";

const conditionOptions = [
  { value: "all", label: "All" },
  { value: "mtumba", label: "Mtumba" },
  { value: "new", label: "Brand new" },
] as const;

type Params = Pick<URLSearchParams, "get"> | null;

/** A list has no single item to be missing, so anything but offline reads as unavailable. */
const listProblem = (problem: LoadProblem) => (problem === "offline" ? "offline" : "unavailable");

/** Reads search, filters and the open item from the URL. Must sit inside <Suspense>. */
export function ShopCatalogueFromUrl() {
  const searchParams = useSearchParams();
  return <ShopCatalogue params={searchParams} />;
}

/**
 * The shop: search, aisles, condition, more filters (size, price) and sort, all answered by the
 * API, with a quick view per item and a bag that sends one WhatsApp order. Everything you narrow
 * by, and the item you're looking at, lives in the URL so a link shows the same thing.
 */
export function ShopCatalogue({ params }: { params: Params }) {
  const { items: bagItems, add } = useBag();
  const { deliveryFreeFrom } = useShopSettings();
  const [filters, setFilters] = useState<Filters>(() => parseFilters(params));
  const [itemCode, setItemCode] = useState<string | null>(() => params?.get("item") ?? null);
  const [bagOpen, setBagOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const list = useProducts(filters);
  const { items: results, total, loading } = list;
  const firstLoad = loading && results.length === 0;
  const item = useProduct(
    itemCode,
    results.find((p) => p.code.toLowerCase() === itemCode?.toLowerCase()),
  );
  const perks = [
    { icon: Store, label: "Mtumba & brand new" },
    { icon: Truck, label: `Free delivery over ${ksh(deliveryFreeFrom)}` },
    { icon: Wallet, label: "Pay on delivery" },
  ];
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
    if (f.size && !sizeChoices(f.cat).includes(f.size)) f.size = null;
    setFilters(f);
    writeUrl(f, itemCode);
  }

  function openItem(code: string | null) {
    setItemCode(code);
    writeUrl(filters, code);
  }

  function quickAdd(p: PublicProduct) {
    if (p.sizes.length > 1) return openItem(p.code);
    const size = p.sizes[0] ?? null;
    const line = bagItems.find((i) => i.id === bagLineId(p, size));
    if (!line || line.qty < p.stock) add(bagLine(p, size));
    else openItem(p.code);
  }

  const inBag = (p: PublicProduct) => bagItems.some((i) => i.id.startsWith(`${p.code}:`));

  const chips: { key: string; label: string; clear: Partial<Filters> }[] = [
    ...(filters.q.trim() ? [{ key: "q", label: `“${filters.q.trim()}”`, clear: { q: "" } }] : []),
    ...(filters.cat
      ? [{ key: "cat", label: categoryLabels[filters.cat], clear: { cat: null } }]
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
              maxLength={80}
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
          <CategoryRail
            value={filters.cat}
            onChange={(cat) => change({ cat })}
            counts={firstLoad || list.problem ? null : list.counts}
          />

          <div className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
            <ChoiceChips
              label="Condition"
              columns={3}
              options={conditionOptions}
              value={filters.cond ?? "all"}
              onChange={(v) => change({ cond: v === "all" ? null : (v as ProductCondition) })}
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
                value={filters.sort ?? ""}
                onChange={(e) => change({ sort: (e.target.value || null) as SortId | null })}
                className="min-w-0 flex-1 sm:w-52 sm:flex-none"
              >
                <option value="">Sort by</option>
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
              {firstLoad ? (
                shopMessages.loadingList
              ) : list.problem ? null : (
                <>
                  {total} {total === 1 ? "item" : "items"}
                </>
              )}
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

          {firstLoad ? (
            <ul
              aria-hidden
              className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6"
            >
              {Array.from({ length: PAGE_SIZE }, (_, i) => (
                <li key={i} className="min-w-0">
                  <ProductCardSkeleton />
                </li>
              ))}
            </ul>
          ) : list.problem ? (
            <LoadProblemNotice
              {...shopMessages.list[listProblem(list.problem)]}
              onRetry={list.retry}
            >
              <WhatsAppButton
                message={shopMessages.askWhatsAppMessage}
                variant="secondary"
                size="lg"
              >
                {shopMessages.askWhatsApp}
              </WhatsAppButton>
            </LoadProblemNotice>
          ) : results.length > 0 ? (
            <>
              <ul
                aria-busy={loading}
                className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6"
              >
                {results.map((p, i) => (
                  <li key={p.code} className="min-w-0">
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
              {total > results.length && (
                <div className="mt-10 grid justify-items-center gap-3">
                  {list.moreProblem && (
                    <p role="alert" className="text-center text-body-sm text-destructive">
                      {shopMessages.more[listProblem(list.moreProblem)]}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    disabled={list.loadingMore}
                    onClick={list.loadMore}
                  >
                    {list.loadingMore
                      ? "Loading…"
                      : list.moreProblem
                        ? shopMessages.retry
                        : `Show more (${total - results.length} left)`}
                  </Button>
                </div>
              )}
            </>
          ) : narrowing === 0 ? (
            <div className="mt-6 grid justify-items-center gap-3 rounded-3xl bg-card px-5 py-12 text-center shadow-card">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
                <PackageOpen aria-hidden className="size-6" />
              </span>
              <p className="display text-title">{shopMessages.empty.title}</p>
              <p className="max-w-sm text-body-sm text-muted-foreground">
                {shopMessages.empty.body}
              </p>
              <WhatsAppButton
                message={shopMessages.askWhatsAppMessage}
                variant="primary"
                size="lg"
                className="mt-1"
              >
                {shopMessages.askWhatsApp}
              </WhatsAppButton>
            </div>
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
        sizes={sizeChoices(filters.cat)}
        resultCount={total}
      />
      <ProductSheet
        open={itemCode !== null}
        product={item.product}
        problem={item.problem}
        onRetry={item.retry}
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
