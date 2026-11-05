import type { ShopSettings } from "@/config/shop-settings";
import type { PublicProduct, PublicProductPage } from "@/features/products/public";
import type { LoadProblem } from "@/features/shop/messages";

import { filterParams, type Filters } from "./filters";

/* The browser's reads from the public API. Failures come back as a value, never a throw. */

export type Result<T> = { ok: true; data: T } | { ok: false; problem: LoadProblem };

async function read<T>(url: string, signal: AbortSignal): Promise<Result<T>> {
  try {
    // The CDN holds these for moments. A browser would reuse them for a minute more, and keep
    // showing something that just sold, so it always asks.
    const response = await fetch(url, { signal, cache: "no-cache" });
    if (response.status === 404) return { ok: false, problem: "not-found" };
    if (response.status === 429) return { ok: false, problem: "busy" };
    if (!response.ok) return { ok: false, problem: "unavailable" };
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, problem: navigator.onLine ? "unavailable" : "offline" };
  }
}

const apiNames: Record<string, string> = { cat: "category", cond: "condition" };

export function productsUrl(filters: Filters, page: number, limit: number): string {
  const search = new URLSearchParams({ page: String(page), limit: String(limit) });
  for (const [name, value] of filterParams(filters)) search.set(apiNames[name] ?? name, value);
  return `/api/products?${search}`;
}

export function fetchProducts(url: string, signal: AbortSignal) {
  return read<PublicProductPage>(url, signal);
}

export function fetchProduct(code: string, signal: AbortSignal) {
  return read<PublicProduct>(`/api/products/${encodeURIComponent(code)}`, signal);
}

export function fetchShopSettings(signal: AbortSignal) {
  return read<ShopSettings>("/api/settings", signal);
}
