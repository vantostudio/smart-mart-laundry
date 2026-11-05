import { apiMessages } from "@/features/admin/messages";
import { removeStaff, setStaffRole } from "@/features/admin/lib/staff";
import { staffId, staffRoleInput } from "@/features/admin/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";

type Context = { params: Promise<{ id: string }> };

/** A malformed id can't be a person, and Postgres would refuse it. */
async function idFrom(context: Context): Promise<string> {
  const { id } = await context.params;
  if (!staffId.safeParse(id).success) throw new AppError("NOT_FOUND", apiMessages.staffNotFound);
  return id;
}

export const PATCH = adminRoute<Context>(
  async ({ request, context, admin }) => {
    const id = await idFrom(context);
    const { role } = await parseBody(request, staffRoleInput);
    return Response.json(await setStaffRole(getDb(), admin.adminId, id, role));
  },
  { role: "owner" },
);

export const DELETE = adminRoute<Context>(
  async ({ context, admin }) => {
    await removeStaff(getDb(), admin.adminId, await idFrom(context));
    return new Response(null, { status: 204 });
  },
  { role: "owner" },
);
