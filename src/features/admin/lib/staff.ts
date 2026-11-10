import { and, asc, eq, ne, or, sql } from "drizzle-orm";

import { apiMessages, errorMessages } from "@/features/admin/messages";
import { adminUser, type AdminRole } from "@/lib/db/schema";
import type { Db } from "@/lib/db/types";
import { AppError } from "@/lib/errors";

import type { AddStaffInput } from "../schema";

/*
 * Who may use the admin. Removing a row ends access on that person's next request, because every
 * request checks it. Nothing here returns an email: staff are told apart by name.
 */

export type StaffMember = { id: string; name: string | null; role: AdminRole };

const columns = { id: adminUser.id, name: adminUser.name, role: adminUser.role };

export function listStaff(db: Db): Promise<StaffMember[]> {
  return db.select(columns).from(adminUser).orderBy(asc(adminUser.createdAt), asc(adminUser.id));
}

export async function addStaff(db: Db, input: AddStaffInput): Promise<StaffMember> {
  const [row] = await db
    .insert(adminUser)
    .values(input)
    .onConflictDoNothing({ target: adminUser.email })
    .returning(columns);
  if (!row) {
    throw new AppError("ALREADY_EXISTS", errorMessages.ALREADY_EXISTS, { field: "email" });
  }
  return row;
}

export async function setOwnName(db: Db, adminId: string, name: string): Promise<void> {
  await db.update(adminUser).set({ name }).where(eq(adminUser.id, adminId));
}

/** True unless this row is the only owner. In the statement, because there are no transactions. */
const leavesAnOwner = or(
  ne(adminUser.role, "owner"),
  sql`(select count(*) from ${adminUser} where ${adminUser.role} = 'owner') > 1`,
);

function refuseSelf(actorId: string, id: string): void {
  if (actorId === id) {
    throw new AppError("CANNOT_CHANGE_SELF", errorMessages.CANNOT_CHANGE_SELF);
  }
}

/** Why a guarded statement changed nothing: the row is gone, or it's the last owner. */
async function refusal(db: Db, id: string): Promise<AppError> {
  const [row] = await db.select(columns).from(adminUser).where(eq(adminUser.id, id)).limit(1);
  return row
    ? new AppError("LAST_OWNER", errorMessages.LAST_OWNER)
    : new AppError("NOT_FOUND", apiMessages.staffNotFound);
}

export async function setStaffRole(
  db: Db,
  actorId: string,
  id: string,
  role: AdminRole,
): Promise<StaffMember> {
  refuseSelf(actorId, id);
  const [row] = await db
    .update(adminUser)
    .set({ role })
    .where(and(eq(adminUser.id, id), role === "owner" ? undefined : leavesAnOwner))
    .returning(columns);
  if (!row) throw await refusal(db, id);
  return row;
}

export async function removeStaff(db: Db, actorId: string, id: string): Promise<void> {
  refuseSelf(actorId, id);
  const rows = await db
    .delete(adminUser)
    .where(and(eq(adminUser.id, id), leavesAnOwner))
    .returning({ id: adminUser.id });
  if (rows.length === 0) throw await refusal(db, id);
}
