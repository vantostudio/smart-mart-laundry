"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

import { Price } from "@/components/shared/price";

import { basketFrom, laundryItems, type LaundryItem } from "./data";

const Context = createContext<LaundryItem[]>(laundryItems);

/**
 * The laundry items staff manage in the admin. The site layout reads them on the server
 * (`getLiveLaundryItems`) and passes them in, so the HTML already has the real items and prices.
 */
export function LaundryItemsProvider({
  items,
  children,
}: {
  items: LaundryItem[];
  children: ReactNode;
}) {
  return <Context.Provider value={items}>{children}</Context.Provider>;
}

export const useLaundryItems = () => useContext(Context);

/** The cheapest basket, for server components outside the laundry page. */
export function BasketFrom(style: Omit<ComponentProps<typeof Price>, "amount">) {
  return <Price amount={basketFrom(useLaundryItems())} {...style} />;
}
