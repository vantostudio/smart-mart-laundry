"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { defaultShopSettings, openingHoursOf, type ShopSettings } from "@/config/shop-settings";
import { fetchShopSettings } from "@/features/shop/lib/api-client";

const Context = createContext<ShopSettings>(defaultShopSettings);

/**
 * The delivery and contact values staff set in the admin. Pages are static, so they start from the
 * defaults and this fills in the saved values. If the request fails the defaults stay, and every
 * page still works.
 */
export function ShopSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultShopSettings);

  useEffect(() => {
    const request = new AbortController();
    void fetchShopSettings(request.signal).then((result) => {
      if (result.ok && !request.signal.aborted) setSettings(result.data);
    });
    return () => request.abort();
  }, []);

  return <Context.Provider value={settings}>{children}</Context.Provider>;
}

export const useShopSettings = () => useContext(Context);

export function useOpeningHours() {
  const settings = useShopSettings();
  return useMemo(() => openingHoursOf(settings), [settings]);
}
