import { z } from "zod";

import { adminRoles } from "@/lib/db/schema";

/* What the staff and profile APIs accept. Strict: unknown fields are refused. */

const name = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[^\0]*$/);

const role = z.enum(adminRoles);

export const ownNameInput = z.object({ name }).strict();

export const addStaffInput = z
  .object({ email: z.string().trim().toLowerCase().pipe(z.email()), name, role })
  .strict();

export const staffRoleInput = z.object({ role }).strict();

export const staffId = z.uuid();

export type AddStaffInput = z.output<typeof addStaffInput>;
