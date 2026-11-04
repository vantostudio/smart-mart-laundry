import { authUnavailableMessage, getNeonAuth } from "@/features/admin/lib/neon-auth";
import { AppError, toErrorShape, type AppErrorShape } from "@/lib/errors";
import { log } from "@/lib/log";
import { requestIdFrom } from "@/lib/request-id";

/*
 * The Neon Auth proxy: Google sign-in, get-session and sign-out go through here to Neon Auth, which
 * sets our cookies. Public by design. Nothing is read or created at import, so the build needs no
 * env; without it every request answers 503 AUTH_UNAVAILABLE.
 */

type Context = RouteContext<"/api/auth/[...path]">;

function errorResponse(error: AppErrorShape, status: number): Response {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

async function proxy(method: "GET" | "POST", request: Request, ctx: Context): Promise<Response> {
  try {
    return await getNeonAuth().handler()[method](request, ctx);
  } catch (err) {
    const requestId = requestIdFrom(request.headers);
    if (err instanceof AppError && err.code === "AUTH_UNAVAILABLE") {
      log.warn("auth_unavailable", { requestId });
      return errorResponse(
        { code: "AUTH_UNAVAILABLE", message: authUnavailableMessage, requestId },
        503,
      );
    }
    log.error("auth_handler_failed", { requestId, err });
    return errorResponse(toErrorShape(err, requestId), 500);
  }
}

export async function GET(request: Request, ctx: Context) {
  return proxy("GET", request, ctx);
}

export async function POST(request: Request, ctx: Context) {
  return proxy("POST", request, ctx);
}
