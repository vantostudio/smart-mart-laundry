"use client";

import { useSyncExternalStore } from "react";

/*
 * The visitor's clock, to the minute. On the server and during hydration it is null, so markup
 * that depends on today's date renders a stable placeholder first and never mismatches (and
 * never calls `new Date()` during a cacheComponents prerender).
 */

const MINUTE = 60_000;
let snapshot: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  snapshot = Math.floor(Date.now() / MINUTE) * MINUTE;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  // Refresh a snapshot left over from an earlier page; React re-reads it after subscribing.
  if (listeners.size === 0) snapshot = Math.floor(Date.now() / MINUTE) * MINUTE;
  listeners.add(listener);
  if (!timer) timer = setInterval(tick, MINUTE);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function getSnapshot() {
  snapshot ??= Math.floor(Date.now() / MINUTE) * MINUTE;
  return snapshot;
}

const getServerSnapshot = () => null;

/** Current time in ms (floored to the minute), or null before the client has mounted. */
export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
