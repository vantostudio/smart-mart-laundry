import { defaultShopSettings, type ShopSettings } from "@/config/shop-settings";
import { shopSettings } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";

import type { UpdateShopSettingsInput } from "../schema";

const columns = {
  deliveryFee: shopSettings.deliveryFee,
  deliveryFreeFrom: shopSettings.deliveryFreeFrom,
  phone: shopSettings.phone,
  weekOpen: shopSettings.weekOpen,
  weekClose: shopSettings.weekClose,
  sundayOpen: shopSettings.sundayOpen,
  sundayClose: shopSettings.sundayClose,
};

/** The one settings row, which the migration adds. */
export async function getShopSettings(db: Db): Promise<ShopSettings> {
  const [row] = await db.select(columns).from(shopSettings).limit(1);
  return row ?? defaultShopSettings;
}

export async function updateShopSettings(
  db: Db,
  patch: UpdateShopSettingsInput,
): Promise<ShopSettings> {
  const [row] = await db
    .insert(shopSettings)
    .values({ ...defaultShopSettings, ...patch })
    .onConflictDoUpdate({ target: shopSettings.id, set: patch })
    .returning(columns);
  return row!;
}
