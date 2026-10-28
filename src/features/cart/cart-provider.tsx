"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type CartItem = { id: string; name: string; price: number; qty: number };

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
export const CART_STORAGE_KEY = "streetmart-cart";

function readStored(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Skip persisting until the stored cart has been loaded, so the first
  // render's empty array never overwrites it.
  const hydrated = useRef(false);

  useEffect(() => {
    // localStorage is only readable after hydration; reading it during render
    // would make the server and client markup disagree.
    // oxlint-disable-next-line react/set-state-in-effect
    setItems(readStored());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage unavailable — cart stays in memory
    }
  }, [items]);

  const add = useCallback((item: Omit<CartItem, "qty">) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
    return { items, count, total, add, setQty, remove, clear };
  }, [items, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
