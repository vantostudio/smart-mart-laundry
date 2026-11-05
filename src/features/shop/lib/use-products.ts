"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PublicProduct, PublicProductPage } from "@/features/products/public";
import type { LoadProblem } from "@/features/shop/messages";

import { fetchProduct, fetchProducts, productsUrl, type Result } from "./api-client";
import type { Filters } from "./filters";

export const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 300;

const noCounts: PublicProductPage["counts"] = { ladies: 0, men: 0, shoes: 0 };

/** `value`, once it has stopped changing for `delay`. */
function useSettled<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return settled;
}

/** What came back for one request. `key` says which, so an older answer is never shown as new. */
type Loaded = {
  key: string;
  items: PublicProduct[];
  page: number;
  total: number;
  counts: PublicProductPage["counts"];
  problem: LoadProblem | null;
  moreProblem: LoadProblem | null;
};

/**
 * The shop's list: page one for the current filters, then more pages added to it. A new search
 * cancels the one before it, so a slow answer can't replace a newer one, and the last results stay
 * up until the new ones arrive.
 */
export function useProducts(filters: Filters) {
  const q = useSettled(filters.q, SEARCH_DELAY_MS);
  const url = productsUrl({ ...filters, q }, 1, PAGE_SIZE);
  const [attempt, setAttempt] = useState(0);
  const key = `${url}#${attempt}`;

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadingMoreFor, setLoadingMoreFor] = useState<string | null>(null);
  const moreRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    const request = new AbortController();
    moreRequest.current?.abort();
    void fetchProducts(url, request.signal).then((result) => {
      if (request.signal.aborted) return;
      setLoaded(
        result.ok
          ? {
              key,
              items: result.data.items,
              page: 1,
              total: result.data.total,
              counts: result.data.counts,
              problem: null,
              moreProblem: null,
            }
          : {
              key,
              items: [],
              page: 0,
              total: 0,
              counts: noCounts,
              problem: result.problem,
              moreProblem: null,
            },
      );
    });
    return () => request.abort();
  }, [url, key]);

  const loadMore = useCallback(async () => {
    if (!loaded || loaded.key !== key || loadingMoreFor === key) return;
    const request = new AbortController();
    moreRequest.current = request;
    setLoadingMoreFor(key);
    const result = await fetchProducts(
      productsUrl({ ...filters, q }, loaded.page + 1, PAGE_SIZE),
      request.signal,
    );
    // Cleared even when cancelled: going back to these filters mustn't find it still loading.
    setLoadingMoreFor((loading) => (loading === key ? null : loading));
    if (request.signal.aborted) return;
    setLoaded((current) => {
      if (current?.key !== key) return current;
      if (!result.ok) return { ...current, moreProblem: result.problem };
      // A product added between pages pushes others along, so skip what's already shown.
      const seen = new Set(current.items.map((p) => p.code));
      return {
        ...current,
        items: [...current.items, ...result.data.items.filter((p) => !seen.has(p.code))],
        page: result.data.page,
        total: result.data.total,
        counts: result.data.counts,
        moreProblem: null,
      };
    });
  }, [filters, q, key, loaded, loadingMoreFor]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const current = loaded?.key === key;
  return {
    items: loaded?.items ?? [],
    total: loaded?.total ?? 0,
    counts: loaded?.counts ?? noCounts,
    /** The first answer for these filters hasn't arrived. */
    loading: !current,
    problem: current ? loaded.problem : null,
    moreProblem: current ? loaded.moreProblem : null,
    loadingMore: loadingMoreFor === key,
    loadMore,
    retry,
  };
}

/**
 * The product behind `?item=SM-1001`. One already on the page is used as it is, otherwise it's
 * fetched, which is what makes a shared link work for anything beyond the first page.
 */
export function useProduct(code: string | null, listed: PublicProduct | undefined) {
  const [attempt, setAttempt] = useState(0);
  const key = `${code}#${attempt}`;
  const [found, setFound] = useState<{ key: string; result: Result<PublicProduct> } | null>(null);

  useEffect(() => {
    if (!code || listed) return;
    const request = new AbortController();
    void fetchProduct(code, request.signal).then((result) => {
      if (!request.signal.aborted) setFound({ key, result });
    });
    return () => request.abort();
  }, [code, listed, key]);

  const result = found?.key === key ? found.result : null;
  return {
    product: listed ?? (result?.ok ? result.data : null),
    problem: !listed && result && !result.ok ? result.problem : null,
    retry: useCallback(() => setAttempt((n) => n + 1), []),
  };
}
