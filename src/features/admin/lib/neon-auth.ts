import "server-only";

import { createNeonAuth, type NeonAuth } from "@neon/auth/next/server";
import { unstable_rethrow } from "next/navigation";
import { cache } from "react";

import { authEnv } from "@/config/env";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { getRequestId } from "@/lib/request-id";

/*
 * Neon Auth (managed Better Auth). The SDK throws at creation without a 32-character cookie secret,
 * so it is built on first use in a request from `authEnv()`, never at import.
 */

/** What people see when sign-in can't work. Final copy comes with `admin-shell`'s messages. */
export const authUnavailableMessage =
  "Sign-in isn't available right now. Please try again in a few minutes.";

/** One Neon Auth instance per request. */
export const getNeonAuth = cache((): NeonAuth => {
  const env = authEnv();
  return createNeonAuth({
    baseUrl: env.NEON_AUTH_BASE_URL,
    cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
  });
});

/** The only fields we read from a session. Untrusted: never a role or an id. */
export type SessionUser = { email: string; emailVerified: boolean; name: string | null };

/*
 * Next refuses cookie writes during a Server Component render and throws this. With refresh off,
 * Neon Auth's `get-session` only sets cookies to clear a session it no longer accepts (expired,
 * revoked, a stale cache cookie). Each Next runtime bundles its own copy of the error class, so
 * match its message.
 */
function isReadOnlyCookiesError(err: unknown): boolean {
  return (
    err instanceof Error &&
    err.message.startsWith("Cookies can only be modified in a Server Action or Route Handler")
  );
}

async function unavailable(status: number | null): Promise<AppError> {
  log.warn("auth_session_unavailable", { requestId: await getRequestId(), status });
  return new AppError("AUTH_UNAVAILABLE", "Neon Auth is unavailable.");
}

/**
 * The signed-in Google account, or `null`. Throws `AUTH_UNAVAILABLE` when auth env is missing or
 * Neon Auth can't be reached, which is not the same as "not signed in".
 */
export async function readSession(): Promise<SessionUser | null> {
  const auth = getNeonAuth();
  let result: Awaited<ReturnType<NeonAuth["getSession"]>>;
  try {
    // No refresh: a refresh sets cookies, which Next forbids while rendering a page. The browser
    // client refreshes through `/api/auth/get-session` instead.
    result = await auth.getSession({ query: { disableRefresh: "true" } });
  } catch (err) {
    unstable_rethrow(err);
    // Signed out: the upstream tried to clear this session's cookies.
    if (isReadOnlyCookiesError(err)) return null;
    throw await unavailable(null);
  }

  const { data, error } = result;
  if (error) {
    if (error.status >= 400 && error.status < 500) return null;
    throw await unavailable(error.status);
  }
  if (!data?.session || !data.user) return null;
  const { email, emailVerified, name } = data.user;
  if (typeof email !== "string") return null;
  return {
    email,
    emailVerified: emailVerified === true,
    name: typeof name === "string" && name !== "" ? name : null,
  };
}
