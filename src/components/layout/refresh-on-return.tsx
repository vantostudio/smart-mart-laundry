"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const QUIET_MS = 60_000;
const WHILE_OPEN_MS = 5 * 60_000;

/**
 * Keeps a page that's left open up to date: prices, the phone number and opening hours can change
 * in the admin. It reloads the server's data, not the page, when someone comes back to the tab
 * (at most once a minute) and every 5 minutes while they stay, so what they've picked is untouched.
 */
export function RefreshOnReturn() {
  const router = useRouter();
  const last = useRef(0);

  useEffect(() => {
    last.current = Date.now();

    function refresh() {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - last.current < QUIET_MS) return;
      last.current = Date.now();
      router.refresh();
    }

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    const timer = setInterval(refresh, WHILE_OPEN_MS);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      clearInterval(timer);
    };
  }, [router]);

  return null;
}
