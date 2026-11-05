import { updateShopSettings } from "@/features/settings/lib/settings";
import { updateShopSettingsInput } from "@/features/settings/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { getDb } from "@/lib/db";

export const PATCH = adminRoute(
  async ({ request }) =>
    Response.json(await updateShopSettings(getDb(), await parseBody(request, updateShopSettingsInput))),
  { role: "owner" },
);
