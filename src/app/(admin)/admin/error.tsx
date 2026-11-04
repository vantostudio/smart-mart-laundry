"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { errorBoundaryMessages } from "@/features/admin/messages";

/** The digest Next attaches to server errors, matching the server log; never the message. */
function digestOf(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("digest" in error)) return null;
  return typeof error.digest === "string" && error.digest !== "" ? error.digest : null;
}

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = digestOf(error);

  return (
    <section className="flex min-h-screen items-center justify-center bg-glow px-gutter py-section">
      <div className="max-w-narrow text-center">
        <h1 className="display text-display">{errorBoundaryMessages.heading}</h1>
        <p className="mt-3 text-body-sm text-muted-foreground">{errorBoundaryMessages.body}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={() => retry()} variant="gradient-primary">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/sign-in">Go to sign-in</Link>
          </Button>
        </div>
        {digest && <p className="mt-6 text-caption text-muted-foreground">Reference: {digest}</p>}
      </div>
    </section>
  );
}
