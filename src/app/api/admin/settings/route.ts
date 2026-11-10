import { revalidateTag } from "next/cache";

import { updateShopSettings } from "@/features/settings/lib/settings";
import { updateShopSettingsInput } from "@/features/settings/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";

export const PATCH = adminRoute(
  async ({ request }) => {
    const saved = await updateShopSettings(
      getDb(),
      await parseBody(request, updateShopSettingsInput),
    );
    // Expire now rather than serve the old values while refreshing: staff see the edit at once.
    revalidateTag(cacheTags.settings, { expire: 0 });
    return Response.json(saved);
  },
  { role: "owner" },
);
