"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Next.js keeps a page's state when you leave it. An add or edit form must not come back holding
 * what was just saved, so it starts again on each visit, and only the browser's back button restores it.
 */
export function FreshOnVisit({ children }: { children: ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
