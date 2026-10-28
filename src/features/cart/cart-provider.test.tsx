import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vite-plus/test";

import { CART_STORAGE_KEY, CartProvider, useCart } from "./cart-provider";

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
    expect(() => renderHook(() => useCart())).toThrow(/inside CartProvider/);
  });
});
