import Link from "next/link";

import { cn } from "@/lib/utils";

/** "Street Mart" logotype with the sunset full stop. Colour follows the surface. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Street Mart home"
      className={cn("inline-flex items-baseline gap-1 text-foreground", className)}
    >
      <span className="font-display text-title leading-none font-bold tracking-tight">
        Street&nbsp;Mart
      </span>
      <span aria-hidden className="size-2 rounded-full bg-gradient-sunset" />
    </Link>
  );
}
