import { addStaff } from "@/features/admin/lib/staff";
import { addStaffInput } from "@/features/admin/schema";
import { adminRoute, parseBody } from "@/lib/api";
import { getDb } from "@/lib/db";

export const POST = adminRoute(
  async ({ request }) =>
    Response.json(await addStaff(getDb(), await parseBody(request, addStaffInput)), {
      status: 201,
    }),
  { role: "owner" },
);
