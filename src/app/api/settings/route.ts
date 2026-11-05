import { getShopSettings } from "@/features/settings/lib/settings";
import { publicRoute } from "@/lib/api";
import { getDb } from "@/lib/db";

export const GET = publicRoute(async () => Response.json(await getShopSettings(getDb())), {
  limit: "settings",
});
