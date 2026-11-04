"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getAuthClient } from "@/features/admin/lib/auth-client";
import { navigateTo } from "@/features/admin/lib/navigate";
import { signInMessages } from "@/features/admin/messages";

/** Signs out through Neon Auth, then a full page load to sign-in. Nothing is written server-side. */
export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function signOut() {
    setBusy(true);
    setFailed(false);
    try {
      const client = await getAuthClient();
      const { error } = await client.signOut();
      if (!error) {
        // Stay busy while the browser leaves.
        navigateTo("/admin/sign-in");
        return;
      }
    } catch {
      // Shown below; the SDK's text never is.
    }
    setFailed(true);
    setBusy(false);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        aria-busy={busy}
        onClick={() => void signOut()}
      >
        {busy ? "Signing out…" : "Sign out"}
      </Button>
      {failed && (
        <p
          role="alert"
          className="w-full rounded-2xl bg-destructive-soft px-4 py-3 text-body-sm font-medium text-destructive"
        >
          {signInMessages.signOutFailed}
        </p>
      )}
    </>
  );
}
