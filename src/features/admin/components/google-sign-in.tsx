"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { failureStatus, getAuthClient } from "@/features/admin/lib/auth-client";
import { navigateTo } from "@/features/admin/lib/navigate";
import { errorMessages, signInMessages } from "@/features/admin/messages";

/*
 * The "Continue with Google" button. Google sends the browser back here with
 * `neon_auth_session_verifier`, which only a browser `getSession()` through our `/api/auth` proxy
 * can exchange for the session cookies; then a full page load goes to `/admin`.
 */

const VERIFIER_PARAM = "neon_auth_session_verifier";

type Status = "idle" | "working" | "finishing";

const labels: Record<Status, string> = {
  idle: "Continue with Google",
  working: "Opening Google…",
  finishing: "Signing you in…",
};

/** One message for any failure, never the SDK's text: an outage, or treat it as cancelled. */
function failureMessage(err: unknown): string {
  const status = failureStatus(err);
  return status === null || status >= 500
    ? errorMessages.AUTH_UNAVAILABLE
    : signInMessages.cancelled;
}

const noSubscribe = () => () => {};

/** False on the server and during hydration, so a tap can't land before the handler exists. */
function useMounted() {
  return useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

const returningFromGoogle = () => new URLSearchParams(window.location.search).has(VERIFIER_PARAM);

/** Whether Google just sent the browser back here; false on the server and during hydration. */
function useReturningFromGoogle() {
  return useSyncExternalStore(noSubscribe, returningFromGoogle, () => false);
}

export function GoogleSignIn({
  message: initialMessage,
  signOutStale,
}: {
  message: string | null;
  /** Clear a Google session the allowlist refused, so the next attempt starts clean. */
  signOutStale: boolean;
}) {
  const mounted = useMounted();
  const returning = useReturningFromGoogle();
  const [status, setStatus] = useState<Status>("idle");
  // Set when the exchange after Google fails, which hands the button back.
  const [exchangeFailed, setExchangeFailed] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (signOutStale) {
      // Best effort: whatever happens, the server still refuses this account.
      getAuthClient()
        .then((client) => client.signOut())
        .catch(() => {});
    }

    if (!returningFromGoogle()) return;
    const fail = (text: string) => {
      setMessage(text);
      setExchangeFailed(true);
    };
    getAuthClient()
      .then((client) => client.getSession())
      .then(
        ({ data, error }) => {
          if (data?.session) {
            // Stay busy while the browser leaves, even once the SDK drops the verifier param.
            setStatus("finishing");
            navigateTo("/admin");
          } else fail(error ? failureMessage(error) : signInMessages.cancelled);
        },
        (err: unknown) => fail(failureMessage(err)),
      );
  }, [signOutStale]);

  async function signIn() {
    setStatus("working");
    setMessage(null);
    try {
      const client = await getAuthClient();
      const { origin } = window.location;
      const { error } = await client.signIn.social({
        provider: "google",
        callbackURL: `${origin}/admin/sign-in`,
        errorCallbackURL: `${origin}/admin/sign-in?reason=SIGN_IN_CANCELLED`,
      });
      // On success the browser is already on its way to Google; stay busy.
      if (!error) return;
      setMessage(failureMessage(error));
    } catch (err) {
      setMessage(failureMessage(err));
    }
    setStatus("idle");
  }

  const shown: Status = returning && !exchangeFailed && status === "idle" ? "finishing" : status;
  const busy = shown !== "idle";

  return (
    <>
      {message && (
        <p
          role="alert"
          className="mt-5 rounded-2xl bg-destructive-soft px-4 py-3 text-body-sm font-medium text-destructive"
        >
          {message}
        </p>
      )}
      <Button
        type="button"
        variant="gradient-primary"
        block
        className="mt-6"
        disabled={!mounted || busy}
        aria-busy={busy}
        onClick={() => void signIn()}
      >
        {labels[shown]}
      </Button>
    </>
  );
}
