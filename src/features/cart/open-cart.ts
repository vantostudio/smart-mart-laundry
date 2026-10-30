"use client";

import { useEffect } from "react";

/*
 * Opening a cart's sheet from elsewhere (the header's orders button). On the cart's own page an
 * event opens it in place; from other pages the link carries a hash that opens it on arrival.
 */

export const cartHash = { laundry: "#cart", bag: "#bag" } as const;
export type CartKind = keyof typeof cartHash;

const eventName = (kind: CartKind) => `streetmart:open-${kind}`;

export function openCart(kind: CartKind) {
  window.dispatchEvent(new Event(eventName(kind)));
}

/** Calls `open` when the page loads with the cart's hash, or when `openCart(kind)` fires. */
export function useOpenCart(kind: CartKind, open: () => void) {
  useEffect(() => {
    if (window.location.hash === cartHash[kind]) open();
    const name = eventName(kind);
    window.addEventListener(name, open);
    return () => window.removeEventListener(name, open);
    // `open` is a state setter wrapper; re-subscribing on every render isn't needed.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);
}
