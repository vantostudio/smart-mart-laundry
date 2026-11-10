import type { createAuthClient } from "@neon/auth/next";

/*
 * The Neon Auth browser client (a Better Auth React client on `<origin>/api/auth`). It opens a
 * broadcast channel when created, so it is loaded and built on first use in the browser, never at
 * import or during SSR. Its calls resolve to `{ data, error }` or reject with an error that may
 * carry a `status`; neither text is ever shown.
 */

export type AuthClient = ReturnType<typeof createAuthClient>;

let client: Promise<AuthClient> | undefined;

export function getAuthClient(): Promise<AuthClient> {
  client ??= import("@neon/auth/next").then(
    (m) => m.createAuthClient(),
    (err: unknown) => {
      // A chunk that failed to load gets another try on the next tap.
      client = undefined;
      throw err;
    },
  );
  return client;
}

/** The HTTP status on a failed call, if it has one (a network failure has none). */
export function failureStatus(err: unknown): number | null {
  if (typeof err !== "object" || err === null || !("status" in err)) return null;
  return typeof err.status === "number" ? err.status : null;
}
