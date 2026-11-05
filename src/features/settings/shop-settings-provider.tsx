"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { defaultShopSettings, openingHoursOf, type ShopSettings } from "@/config/shop-settings";

const Context = createContext<ShopSettings>(defaultShopSettings);

/**
 * The delivery and contact values staff set in the admin. The site layout reads them on the server
 * (`getLiveShopSettings`) and passes them in, so the HTML already has the real values and nothing
 * changes after load.
 */
export function ShopSettingsProvider({
  settings,
  children,
}: {
  settings: ShopSettings;
  children: ReactNode;
}) {
  return <Context.Provider value={settings}>{children}</Context.Provider>;
}

export const useShopSettings = () => useContext(Context);

export function useOpeningHours() {
  const settings = useShopSettings();
  return useMemo(() => openingHoursOf(settings), [settings]);
}
