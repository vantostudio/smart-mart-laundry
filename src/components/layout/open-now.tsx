"use client";

import { useSyncExternalStore } from "react";

import { site } from "@/config/site";
import { getOpenStatus } from "@/lib/opening-hours";
import { cn } from "@/lib/utils";

const MINUTE = 60_000;

// The snapshot is the current minute, so the status re-renders at most once a minute.
function subscribe(onChange: () => void) {
  const id = setInterval(onChange, MINUTE / 4);
  return () => clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / MINUTE);
// No clock on the server: prerendered HTML has an empty line that fills in after hydration.
const serverMinute = () => null;

/** "Open now, closes 8 PM" / "Closed, opens 7 AM", computed in the browser in shop time. */
export function OpenNow({ className }: { className?: string }) {
  const minute = useSyncExternalStore(subscribe, currentMinute, serverMinute);
  const status =
    minute === null
      ? null
      : getOpenStatus(new Date(minute * MINUTE), site.openingHours, site.timeZone);

  return (
    // Fixed line height so nothing shifts when the text appears.
    <p className={cn("flex h-6 items-center gap-2 text-body-sm font-semibold", className)}>
      {status && (
        <>
          <span
            aria-hidden
            className={cn("size-2 rounded-full", status.open ? "bg-leaf" : "bg-clay")}
          />
          {status.label}
        </>
      )}
    </p>
  );
}
