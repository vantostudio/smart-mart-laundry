import { revalidateTag } from "next/cache";

import { laundryMessages } from "@/features/admin/messages";
import { createLaundryItem } from "@/features/laundry/lib/items";
import { createLaundryItemInput } from "@/features/laundry/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";

const fieldMessage = (field: string) =>
  laundryMessages.fields[field as keyof typeof laundryMessages.fields];

export const POST = adminRoute(
  async ({ request }) => {
    const input = await parseBody(request, createLaundryItemInput, fieldMessage);
    const created = await createLaundryItem(getDb(), input);
    revalidateTag(cacheTags.laundry, { expire: 0 });
    return Response.json(created, { status: 201 });
  },
  { role: "owner" },
);
