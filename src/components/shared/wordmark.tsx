import Link from "next/link";

import { cn } from "@/lib/utils";

import { LogoMark } from "./logo-mark";

/** Logo: the hanger "S" mark and "Street Mart" with the sunset full stop. Colour follows the surface. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Street Mart home"
      className={cn("inline-flex min-h-11 items-center gap-1.5 text-foreground", className)}
    >
      <LogoMark className="-ml-1 size-10" />
      <span className="font-display text-title leading-none font-semibold tracking-tight">
        Street&nbsp;Mart
      </span>
      <span aria-hidden className="mt-2 -ml-0.5 size-2 rounded-full bg-gradient-sunset" />
    </Link>
  );
}
