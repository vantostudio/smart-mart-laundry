import { revalidateTag } from "next/cache";

import { apiMessages, laundryMessages } from "@/features/admin/messages";
import {
  deleteLaundryItem,
  getLaundryItem,
  isUploadedPhoto,
  updateLaundryItem,
} from "@/features/laundry/lib/items";
import { laundryItemId, updateLaundryItemInput } from "@/features/laundry/schema";
import { removePhotos } from "@/features/products/lib/photos";
import { adminRoute, parseBody } from "@/lib/api";
import { cacheTags } from "@/lib/cache-tags";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

async function idFrom(context: Context): Promise<string> {
  const parsed = laundryItemId.safeParse((await context.params).id);
  if (!parsed.success) throw new AppError("NOT_FOUND", apiMessages.laundryItemNotFound);
  return parsed.data;
}

const fieldMessage = (field: string) =>
  laundryMessages.fields[field as keyof typeof laundryMessages.fields];

const uploaded = (image: string) => (isUploadedPhoto(image) ? [image] : []);

export const PATCH = adminRoute(
  async ({ request, context }: { request: Request; context: Context }) => {
    const id = await idFrom(context);
    const patch = await parseBody(request, updateLaundryItemInput, fieldMessage);
    const db = getDb();
    const before = await getLaundryItem(db, id);
    const updated = await updateLaundryItem(db, id, patch);
    revalidateTag(cacheTags.laundry, { expire: 0 });
    if (updated.image !== before.image) await removePhotos(db, uploaded(before.image));
    return Response.json(updated);
  },
  { role: "owner" },
);

export const DELETE = adminRoute(
  async ({ context }: { context: Context }) => {
    const db = getDb();
    const image = await deleteLaundryItem(db, await idFrom(context));
    revalidateTag(cacheTags.laundry, { expire: 0 });
    await removePhotos(db, uploaded(image));
    return new Response(null, { status: 204 });
  },
  { role: "owner" },
);
