import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vite-plus/test";

import {
  BAG_STORAGE_KEY,
  BagProvider,
  CART_STORAGE_KEY,
  CartProvider,
  useBag,
  useCart,
} from "./cart-provider";

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;
const basket = { id: "basket-small", name: "Small basket", price: 150 };

describe("CartProvider", () => {
  it("adds items, increments quantity and totals the cart", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(basket));
    act(() => result.current.add(basket));

    expect(result.current.items).toEqual([{ ...basket, qty: 2 }]);
    expect(result.current.count).toBe(2);
    expect(result.current.total).toBe(300);
  });

  it("removes an item when its quantity drops to zero", () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => result.current.add(basket));
    act(() => result.current.setQty(basket.id, 0));

    expect(result.current.items).toEqual([]);
  });

  it("restores the saved cart instead of overwriting it on mount", async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([{ ...basket, qty: 3 }]));

    const { result } = renderHook(() => useCart(), { wrapper });

    await waitFor(() => expect(result.current.count).toBe(3));
    expect(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]")).toEqual([
      { ...basket, qty: 3 },
    ]);
  });

  it("throws when used outside the provider", () => {
    expect(() => renderHook(() => useCart())).toThrow(/inside its provider/);
  });

  it("caps quantity at max, so a one-off piece stays at 1", () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    const piece = { id: "SM-1001:M", name: "Denim jacket", price: 900, max: 1 };

    act(() => result.current.add(piece));
    act(() => result.current.add(piece));
    act(() => result.current.setQty(piece.id, 5));

    expect(result.current.items[0]?.qty).toBe(1);
  });

  it("keeps the shop bag separate from the laundry basket", async () => {
    const both = ({ children }: { children: ReactNode }) => (
      <CartProvider>
        <BagProvider>{children}</BagProvider>
      </CartProvider>
    );
    const { result } = renderHook(() => ({ cart: useCart(), bag: useBag() }), { wrapper: both });

    act(() => result.current.bag.add({ id: "SM-1001:M", name: "Denim jacket", price: 900 }));

    expect(result.current.cart.items).toEqual([]);
    expect(result.current.bag.count).toBe(1);
    await waitFor(() => expect(localStorage.getItem(BAG_STORAGE_KEY)).toContain("SM-1001"));
    expect(localStorage.getItem(CART_STORAGE_KEY)).toBe("[]");
  });
});
