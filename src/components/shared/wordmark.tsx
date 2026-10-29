import Link from "next/link";

import { cn } from "@/lib/utils";

/** "Street Mart" logotype with the sunset full stop. Colour follows the surface. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Street Mart home"
      className={cn("inline-flex min-h-11 items-center gap-1 text-foreground", className)}
    >
      <span className="font-display text-title leading-none font-semibold tracking-tight">
        Street&nbsp;Mart
      </span>
      <span aria-hidden className="mt-2 size-2 rounded-full bg-gradient-sunset" />
    </Link>
  );
}
