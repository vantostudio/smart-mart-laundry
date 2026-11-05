"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useLaundryItems } from "@/features/laundry/laundry-items-provider";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  /** Shown under the name, e.g. "SM-1024 · Size M". */
  detail?: string;
  /** Most that can be ordered (stock). */
  max?: number;
  /** The product's main photo, as the small thumbnail. Always set on shop lines, null when it has none. Older saved lines hold the full photo. */
  photo?: string | null;
  /** The full photo, shown if the thumbnail can't load. Missing on older saved lines. */
  fullPhoto?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

const clamp = (qty: number, max?: number) => (max === undefined ? qty : Math.min(qty, max));

function readStored(key: string, keep: (item: CartItem) => boolean): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]).filter(keep) : [];
  } catch {
    return [];
  }
}

/**
 * A cart kept in localStorage under `storageKey`. Each call makes its own context, so the laundry
 * basket and the shop bag never mix. `keep` decides which saved lines are still good.
 */
function createCart(
  storageKey: string,
  name: string,
  keep: (item: CartItem) => boolean = () => true,
) {
  const Context = createContext<CartContextValue | null>(null);

  function Provider({
    children,
    refresh,
  }: {
    children: ReactNode;
    /** Brings a saved line up to date, or null when it can't be ordered any more. */
    refresh?: (item: CartItem) => CartItem | null;
  }) {
    const [items, setItems] = useState<CartItem[]>([]);
    // Persist only once the stored cart has been loaded. State (not a ref), so the save effect in
    // the same commit as the load still sees false and can't overwrite storage with the initial [].
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      // localStorage is only readable after hydration; reading it during render
      // would make the server and client markup disagree.
      // oxlint-disable-next-line react/set-state-in-effect
      setItems(readStored(storageKey, keep));
      setLoaded(true);
    }, []);

    useEffect(() => {
      if (!loaded) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {
        // storage unavailable — cart stays in memory
      }
    }, [items, loaded]);

    const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, ...item, qty: clamp(i.qty + qty, item.max) } : i,
          );
        }
        return [...prev, { ...item, qty: clamp(qty, item.max) }];
      });
    }, []);

    const setQty = useCallback((id: string, qty: number) => {
      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => i.id !== id)
          : prev.map((i) => (i.id === id ? { ...i, qty: clamp(qty, i.max) } : i)),
      );
    }, []);

    const clear = useCallback(() => setItems([]), []);

    const value = useMemo<CartContextValue>(() => {
      const lines = refresh ? items.flatMap((i) => refresh(i) ?? []) : items;
      const count = lines.reduce((sum, i) => sum + i.qty, 0);
      const total = lines.reduce((sum, i) => sum + i.qty * i.price, 0);
      return { items: lines, count, total, add, setQty, clear };
    }, [items, refresh, add, setQty, clear]);

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useCartContext(): CartContextValue {
    const ctx = useContext(Context);
    if (!ctx) throw new Error(`${name} must be used inside its provider`);
    return ctx;
  }

  return { Provider, useCart: useCartContext };
}

/** The laundry basket (/laundry). */
export const CART_STORAGE_KEY = "streetmart-cart";
const laundry = createCart(CART_STORAGE_KEY, "useCart");

/**
 * A saved basket can be days old, so its lines always show today's name and price, and an item
 * staff have deleted drops out. An old price can't reach a WhatsApp order.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const items = useLaundryItems();
  const refresh = useCallback(
    (line: CartItem) => {
      const item = items.find((i) => i.id === line.id);
      return item ? { ...line, name: item.name, price: item.price } : null;
    },
    [items],
  );
  return <laundry.Provider refresh={refresh}>{children}</laundry.Provider>;
}
export const useCart = laundry.useCart;

/** The shop bag (/shop). */
export const BAG_STORAGE_KEY = "streetmart-bag";
// Lines saved before the shop had real products have no `photo` and can't be ordered.
const bag = createCart(BAG_STORAGE_KEY, "useBag", (item) => item.photo !== undefined);
export const BagProvider = bag.Provider;
export const useBag = bag.useCart;
