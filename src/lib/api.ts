import "server-only";

import { unstable_rethrow } from "next/navigation";
import type { z } from "zod";

import { requireAdminForAction, type AdminContext } from "@/features/admin/lib/auth";
import { actionRefusalMessages, apiMessages, errorMessages } from "@/features/admin/messages";
import { driverFailure } from "@/lib/db/errors";
import { AppError, toErrorShape, type AppErrorCode, type AppErrorShape } from "@/lib/errors";
import { log } from "@/lib/log";
import { clientIdFrom, rateLimit, type LimitGroup } from "@/lib/rate-limit";
import { getRequestId } from "@/lib/request-id";

/*
 * The way into an API route. `adminRoute` checks the caller before the handler runs, so a handler
 * can't forget to. `publicRoute` is for what the public shop reads. Both turn anything thrown into
 * `{ error }` with the right status.
 */

const statusFor: Record<AppErrorCode, number> = {
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  VALIDATION: 400,
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  LAST_OWNER: 409,
  CANNOT_CHANGE_SELF: 409,
  RATE_LIMITED: 429,
  AUTH_UNAVAILABLE: 503,
  INTERNAL: 500,
};

const readMethods = new Set(["GET", "HEAD"]);

function errorResponse(error: AppErrorShape): Response {
  return Response.json({ error }, { status: statusFor[error.code] });
}

/**
 * Counts the request against `group` and, over the limit, answers 429 with `Retry-After`. Never
 * cached, and the log line names the route and group, never the client.
 */
async function limitedResponse(
  request: Request,
  group: LimitGroup,
  key: string,
  body: (requestId: string) => { error: Record<string, unknown> },
  adminId?: string,
): Promise<Response | null> {
  const result = await rateLimit(key, group);
  if (result.allowed) return null;
  const requestId = await getRequestId();
  log.warn("rate_limited", {
    requestId,
    ...(adminId === undefined ? {} : { adminId }),
    route: new URL(request.url).pathname,
    group,
  });
  return Response.json(body(requestId), {
    status: statusFor.RATE_LIMITED,
    headers: { "Retry-After": String(result.retryAfterSeconds), "Cache-Control": "no-store" },
  });
}

/** Short enough that a sold-out item leaves the shop quickly; long enough to let Neon sleep. */
const publicCache = "public, s-maxage=30, stale-while-revalidate=60";

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

/**
 * Wraps a handler. Responses are never cached, because they depend on who is asking. Pass
 * `{ role: "owner" }` for what only an owner may do, `{ limit: "upload" }` for the tighter photo
 * limit. Requests are counted by IP before any auth work, then by signed-in person.
 */
export function adminRoute<Context>(
  handler: (args: AdminRequest<Context>) => Promise<Response>,
  options?: { role?: "owner"; limit?: "upload" },
): (request: Request, context: Context) => Promise<Response> {
  return async (request, context) => {
    const requestId = await getRequestId();
    let response: Response;
    const tooMany = (requestId: string) => ({
      error: { code: "RATE_LIMITED", message: errorMessages.RATE_LIMITED, requestId },
    });
    try {
      if (!readMethods.has(request.method) && !isSameOrigin(request)) {
        throw new AppError("FORBIDDEN", actionRefusalMessages.FORBIDDEN);
      }
      const gated = await limitedResponse(
        request,
        "adminGate",
        clientIdFrom(request.headers),
        tooMany,
      );
      if (gated) return gated;
      const access = await requireAdminForAction(options);
      if (!access.ok) {
        response = errorResponse(access.error);
      } else {
        const group = options?.limit ?? (readMethods.has(request.method) ? "adminRead" : "write");
        const limited = await limitedResponse(
          request,
          group,
          `admin:${access.admin.adminId}`,
          tooMany,
          access.admin.adminId,
        );
        response = limited ?? (await handler({ request, context, admin: access.admin }));
      }
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

const expectedPublicErrors = new Set<AppErrorCode>(["VALIDATION", "NOT_FOUND"]);

/**
 * Wraps a GET anyone can call. Only success is cached. The error body holds the code and no
 * message, because a configuration message names server settings; the shop has its own copy.
 */
export function publicRoute<Context>(
  handler: (args: { request: Request; context: Context }) => Promise<Response>,
  options?: { limit?: "settings" },
): (request: Request, context: Context) => Promise<Response> {
  return async (request, context) => {
    try {
      const limited = await limitedResponse(
        request,
        options?.limit ?? "read",
        clientIdFrom(request.headers),
        (requestId) => ({ error: { code: "RATE_LIMITED", requestId } }),
      );
      if (limited) return limited;
      const response = await handler({ request, context });
      response.headers.set("Cache-Control", publicCache);
      return response;
    } catch (err) {
      unstable_rethrow(err);
      const requestId = await getRequestId();
      const { code } = toErrorShape(err, requestId);
      if (!expectedPublicErrors.has(code)) {
        log.error("public_api_failed", { requestId, ...driverFailure(err) });
      }
      return Response.json(
        { error: { code, requestId } },
        { status: statusFor[code], headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}

/** Parsed input, or `VALIDATION` naming the field. Zod's own messages can echo what was sent. */
function parseInput<Schema extends z.ZodType>(schema: Schema, input: unknown): z.output<Schema> {
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
