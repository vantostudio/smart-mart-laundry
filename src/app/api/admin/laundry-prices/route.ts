import { revalidateTag } from "next/cache";

import { laundryMessages } from "@/features/admin/messages";
import { setLaundryPrices } from "@/features/laundry/lib/items";
import { updateLaundryPricesInput } from "@/features/laundry/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";

export const PATCH = adminRoute(
  async ({ request }) => {
    const prices = await parseBody(
      request,
      updateLaundryPricesInput,
      () => laundryMessages.fields.price,
    );
    await setLaundryPrices(getDb(), prices);
    revalidateTag(cacheTags.laundry, { expire: 0 });
    return new Response(null, { status: 204 });
  },
  { role: "owner" },
);
