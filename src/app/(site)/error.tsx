"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-glow px-gutter">
      <div className="max-w-narrow text-center">
        <p className="eyebrow">Something went wrong</p>
        <h1 className="mt-3 display text-display">This page didn&apos;t load</h1>
        <p className="mt-3 text-body-sm text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} variant="gradient-primary">
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Go home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
