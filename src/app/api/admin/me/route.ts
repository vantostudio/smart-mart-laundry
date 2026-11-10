import { setOwnName } from "@/features/admin/lib/staff";
import { ownNameInput } from "@/features/admin/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { getDb } from "@/lib/db";

export const PATCH = adminRoute(async ({ request, admin }) => {
  const { name } = await parseBody(request, ownNameInput);
  await setOwnName(getDb(), admin.adminId, name);
  return Response.json({ name });
});
