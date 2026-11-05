import "server-only";

import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";

import { requireAdminForAction, type AdminContext } from "@/features/admin/lib/auth";
import { actionRefusalMessages, apiMessages } from "@/features/admin/messages";
import { driverFailure } from "@/lib/db/errors";
import { AppError, toErrorShape, type AppErrorCode, type AppErrorShape } from "@/lib/errors";
import { log } from "@/lib/log";
import { getRequestId } from "@/lib/request-id";

/*
 * The one way into an admin API route. `adminRoute` checks the caller before the handler runs, so a
 * handler can't forget to, and turns anything thrown into `{ error }` with the right status.
 */

const statusFor: Record<AppErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  ADMIN_DISABLED: 403,
  VALIDATION: 400,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  LAST_OWNER: 409,
  CANNOT_CHANGE_SELF: 409,
  AUTH_UNAVAILABLE: 503,
  INTERNAL: 500,
};

const readMethods = new Set(["GET", "HEAD"]);

function errorResponse(error: AppErrorShape): Response {
  return Response.json({ error }, { status: statusFor[error.code] });
}

/**
 * Route handlers don't get the check server actions get, so a write must prove it came from our own
 * pages: the browser sets `Origin` and a cross-site page can't fake it. No `Origin`, no write.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export type AdminRequest<Context> = { request: Request; context: Context; admin: AdminContext };

/** Wraps a handler. Responses are never cached, because they depend on who is asking. */
export function adminRoute<Context>(
  handler: (args: AdminRequest<Context>) => Promise<Response>,
): (request: Request, context: Context) => Promise<Response> {
  return async (request, context) => {
    const requestId = await getRequestId();
    let response: Response;
    try {
      if (!readMethods.has(request.method) && !isSameOrigin(request)) {
        throw new AppError("FORBIDDEN", actionRefusalMessages.FORBIDDEN);
      }
      const access = await requireAdminForAction();
      response = access.ok
        ? await handler({ request, context, admin: access.admin })
        : errorResponse(access.error);
    } catch (err) {
      unstable_rethrow(err);
      if (!(err instanceof AppError)) {
        log.error("admin_api_failed", { requestId, ...driverFailure(err) });
      }
      response = errorResponse(toErrorShape(err, requestId));
    }
    response.headers.set("Cache-Control", "no-store");
    return response;
  };
}

/** Parsed input, or `VALIDATION` naming the field. Zod's own messages can echo what was sent. */
export function parseInput<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.output<Schema> {
  const parsed = schema.safeParse(input);
  if (parsed.success) return parsed.data;
  const field = parsed.error.issues[0]?.path.join(".");
  throw new AppError("VALIDATION", apiMessages.invalidInput, field ? { field } : undefined);
}

/** The JSON body, parsed. */
export async function parseBody<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): Promise<z.output<Schema>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new AppError("VALIDATION", apiMessages.invalidJson);
  }
  return parseInput(schema, body);
}

/** The query string, parsed. */
export function parseQuery<Schema extends z.ZodType>(
  request: Request,
  schema: Schema,
): z.output<Schema> {
  return parseInput(schema, Object.fromEntries(new URL(request.url).searchParams));
}
