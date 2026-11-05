import "server-only";

import { eq } from "drizzle-orm";
import type { Route } from "next";
import { redirect, unstable_rethrow } from "next/navigation";
import { cache } from "react";

import { actionRefusalMessages } from "@/features/admin/messages";
import { getDb, type Db } from "@/lib/db";
import { driverFailure } from "@/lib/db/errors";
import { adminUser, type AdminRole } from "@/lib/db/schema";
import {
  AppError,
  internalErrorMessage,
  toErrorShape,
  type AppErrorCode,
  type AppErrorShape,
} from "@/lib/errors";
import { log } from "@/lib/log";
import { getRequestId } from "@/lib/request-id";

import { readSession, type SessionUser } from "./neon-auth";

/*
 * The admin access check. Every admin page calls `requireAdmin()` and every admin action calls
 * `requireAdminForAction()`; there is no middleware. An admin is a verified Google email with a row
 * in `admin_user`, and the role comes only from that row. Deny by default; nothing is written.
 */

export type AdminContext = { adminId: string; email: string; name: string | null; role: AdminRole };

export type AdminDecision =
  | { status: "admin"; admin: AdminContext }
  | { status: "unauthenticated" }
  | { status: "forbidden" };

type DenialReason = "unverified_email" | "not_on_allowlist";

/** Only the domain: the local part of an email identifies a person. */
function emailDomain(email: string): string {
  const domain = email
    .slice(email.lastIndexOf("@") + 1)
    .trim()
    .toLowerCase();
  return email.includes("@") && domain !== "" ? domain : "unknown";
}

function deny(requestId: string, reason: DenialReason, email: string): AdminDecision {
  log.warn("sign_in_denied", { requestId, reason, emailDomain: emailDomain(email) });
  return { status: "forbidden" };
}

/**
 * The allowlist row for an email. Drizzle's query error puts the params, so the email, in its
 * message and on itself, and Next logs whatever is rethrown: keep it from going any further.
 */
async function findAdminRow(db: Db, email: string, requestId: string) {
  try {
    const [row] = await db
      .select({
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      })
      .from(adminUser)
      .where(eq(adminUser.email, email))
      .limit(1);
    return row;
  } catch (err) {
    unstable_rethrow(err);
    log.error("admin_lookup_failed", { requestId, ...driverFailure(err) });
    throw new AppError("INTERNAL", internalErrorMessage);
  }
}

/** The decision for one session. Reads at most one `admin_user` row; errors propagate. */
export async function resolveAdmin(deps: {
  readSession: () => Promise<SessionUser | null>;
  db: () => Db;
  requestId: string;
}): Promise<AdminDecision> {
  const session = await deps.readSession();
  if (!session) return { status: "unauthenticated" };
  if (session.emailVerified !== true)
    return deny(deps.requestId, "unverified_email", session.email);

  const email = session.email.trim().toLowerCase();
  const row = await findAdminRow(deps.db(), email, deps.requestId);
  if (!row) return deny(deps.requestId, "not_on_allowlist", email);
  return {
    status: "admin",
    admin: { adminId: row.id, email: row.email, name: row.name, role: row.role },
  };
}

/** Once per request, however many checks a page and its actions make. */
const getAdminDecision = cache(async () =>
  resolveAdmin({ readSession, db: getDb, requestId: await getRequestId() }),
);

/**
 * The signed-in admin, or `null`. Throws `AUTH_UNAVAILABLE` when auth or the database isn't
 * configured or auth can't be reached, and `INTERNAL` when the allowlist lookup fails, so an outage
 * never reads as "please sign in".
 */
export const getAdmin = cache(async (): Promise<AdminContext | null> => {
  const decision = await getAdminDecision();
  return decision.status === "admin" ? decision.admin : null;
});

type Refusal = Extract<AppErrorCode, "UNAUTHENTICATED" | "FORBIDDEN" | "AUTH_UNAVAILABLE">;

type Check = { ok: true; admin: AdminContext } | { ok: false; code: Refusal };

/** The shared decision. Errors other than `AUTH_UNAVAILABLE` are logged and rethrown. */
async function check(opts?: { role?: "owner" }): Promise<Check> {
  let decision: AdminDecision;
  try {
    decision = await getAdminDecision();
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof AppError && err.code === "AUTH_UNAVAILABLE") {
      return { ok: false, code: "AUTH_UNAVAILABLE" };
    }
    log.error("admin_check_failed", { requestId: await getRequestId(), err });
    throw err;
  }
  if (decision.status === "unauthenticated") return { ok: false, code: "UNAUTHENTICATED" };
  if (decision.status === "forbidden") return { ok: false, code: "FORBIDDEN" };
  if (opts?.role !== undefined && decision.admin.role !== opts.role) {
    return { ok: false, code: "FORBIDDEN" };
  }
  return { ok: true, admin: decision.admin };
}

/** For admin pages: the admin, or a redirect to the sign-in page with the reason. */
export async function requireAdmin(opts?: { role?: "owner" }): Promise<AdminContext> {
  const result = await check(opts);
  if (!result.ok) redirect(`/admin/sign-in?reason=${result.code}` as Route);
  return result.admin;
}

const refusalMessages: Record<Refusal, string> = actionRefusalMessages;

/** For admin actions: the same decision as `requireAdmin`, returned as a result, never a redirect. */
export async function requireAdminForAction(opts?: {
  role?: "owner";
}): Promise<{ ok: true; admin: AdminContext } | { ok: false; error: AppErrorShape }> {
  let result: Check;
  try {
    result = await check(opts);
  } catch (err) {
    unstable_rethrow(err);
    return { ok: false, error: toErrorShape(err, await getRequestId()) };
  }
  if (result.ok) return result;
  return {
    ok: false,
    error: {
      code: result.code,
      message: refusalMessages[result.code],
      requestId: await getRequestId(),
    },
  };
}
