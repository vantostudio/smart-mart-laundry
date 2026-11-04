import { redirect, unstable_rethrow } from "next/navigation";

import { getAdmin } from "@/features/admin/lib/auth";
import { errorMessages, signInReasonMessage } from "@/features/admin/messages";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { getRequestId } from "@/lib/request-id";

import { GoogleSignIn } from "./google-sign-in";

const cardClass = "w-full max-w-narrow rounded-3xl bg-card p-6 shadow-card";

/** Whether auth is unavailable; an admin is sent on, anything unexpected goes to the boundary. */
async function checkSignedIn(): Promise<{ unavailable: boolean }> {
  try {
    if (await getAdmin()) redirect("/admin");
    return { unavailable: false };
  } catch (err) {
    unstable_rethrow(err);
    if (err instanceof AppError && err.code === "AUTH_UNAVAILABLE") return { unavailable: true };
    log.error("sign_in_check_failed", { requestId: await getRequestId(), err });
    throw err;
  }
}

/**
 * The sign-in card. `?reason=` only ever picks copy from the allowlist; the raw param, and
 * Better Auth's `error` and `error_description`, are never read into the page.
 */
export async function SignInPanel({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { reason } = await searchParams;
  const { unavailable } = await checkSignedIn();
  const message =
    signInReasonMessage(reason) ?? (unavailable ? errorMessages.AUTH_UNAVAILABLE : null);

  return (
    <section aria-labelledby="sign-in-heading" className={cardClass}>
      <h1 id="sign-in-heading" className="display text-display">
        Staff sign-in
      </h1>
      <p className="mt-2 text-body-sm text-muted-foreground">
        For the Street Mart team. Use the Google account the owner added.
      </p>
      <GoogleSignIn message={message} signOutStale={reason === "FORBIDDEN"} />
    </section>
  );
}

/** Holds the card's place while the session is checked. */
export function SignInPanelSkeleton() {
  return (
    <div aria-busy="true" className={cardClass}>
      <span className="sr-only">Loading</span>
      <div aria-hidden className="space-y-3 motion-safe:animate-pulse">
        <div className="h-9 w-3/4 rounded-full bg-secondary" />
        <div className="h-10 rounded-2xl bg-secondary" />
        <div className="mt-6 h-11 rounded-full bg-secondary" />
      </div>
    </div>
  );
}
