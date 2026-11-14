import "server-only";

import { getCloudflareContext } from "@opennextjs/cloudflare";

/*
 * A guard against floods, applied by `publicRoute` and `adminRoute` so no route can forget it.
 *
 * On the Worker each group counts through its own Cloudflare Rate Limiting binding (`ratelimits` in
 * `wrangler.jsonc`), shared by every instance in a Cloudflare location. Cloudflare counts
 * per location and lets a few requests through while counts sync, so treat the limits as
 * approximate. Under `next dev`, in tests, or if a binding is missing or fails, the count falls
 * back to the memory of one instance, which stops a runaway script but not a determined attacker.
 * The database is deliberately not the store: the point is to keep traffic away from Neon so it can
 * sleep.
 */

type Limit = { max: number; windowMs: number };

/**
 * Requests allowed per window, per client (or per signed-in person for admin groups). Public reads
 * are generous because many shoppers share one mobile carrier IP, and one shopper's typing
 * (debounced 300ms), filters, Show more and item views add up to well under 30 a minute. A window
 * is 10 or 60 seconds, the only periods a binding offers, and `wrangler.jsonc` repeats each limit
 * (`rate-limit.test.ts` checks they match).
 */
export const limits = {
  /** Public product reads. */
  read: { max: 180, windowMs: 60_000 },
  /** Any admin request by IP, before auth work. Generous: all staff may share the shop's IP. */
  adminGate: { max: 360, windowMs: 60_000 },
  /** Admin GETs, per person. */
  adminRead: { max: 180, windowMs: 60_000 },
  /** Admin writes, per person. */
  write: { max: 90, windowMs: 60_000 },
  /** Photo uploads, per person: one request per photo, so a whole batch of products fits. */
  upload: { max: 60, windowMs: 60_000 },
} as const satisfies Record<string, Limit>;

/** The Rate Limiting binding that counts each group on the Worker. */
export const bindingNames = {
  read: "RATE_LIMIT_READ",
  adminGate: "RATE_LIMIT_ADMIN_GATE",
  adminRead: "RATE_LIMIT_ADMIN_READ",
  write: "RATE_LIMIT_WRITE",
  upload: "RATE_LIMIT_UPLOAD",
} as const satisfies Record<keyof typeof limits, string>;

export type LimitGroup = keyof typeof limits;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** The one thing a store does. */
export type RateLimitStore = {
  hit(key: string, group: LimitGroup): Promise<RateLimitResult>;
};

/** What a Cloudflare Rate Limiting binding offers. */
export type RateLimitBinding = {
  limit(options: { key: string }): Promise<{ success: boolean }>;
};

/** Fixed windows in memory. Expired entries are swept when full, then the oldest are dropped. */
export function createMemoryStore(
  options: { maxEntries?: number; now?: () => number } = {},
): RateLimitStore {
  const { maxEntries = 5000, now = Date.now } = options;
  const windows = new Map<string, { count: number; resetAt: number }>();

  function makeRoom(at: number) {
    if (windows.size < maxEntries) return;
    for (const [key, entry] of windows) if (entry.resetAt <= at) windows.delete(key);
    // Still full of live entries: drop the oldest (Map keeps insertion order, and a window is
    // inserted when it starts).
    for (const key of windows.keys()) {
      if (windows.size < maxEntries) break;
      windows.delete(key);
    }
  }

  return {
    async hit(key, group) {
      const at = now();
      const { max, windowMs } = limits[group];
      const id = `${group}:${key}`;
      const entry = windows.get(id);
      if (!entry || entry.resetAt <= at) {
        windows.delete(id);
        makeRoom(at);
        windows.set(id, { count: 1, resetAt: at + windowMs });
        return { allowed: true };
      }
      entry.count += 1;
      if (entry.count <= max) return { allowed: true };
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - at) / 1000)),
      };
    },
  };
}

/**
 * Counts with each group's binding from `bindings()`, and with `fallback` when there is none or it
 * throws, so a limiter fault never takes the API down. A binding doesn't say when its window ends,
 * so `Retry-After` is the whole window.
 */
export function createBindingStore(
  bindings: () => Record<string, unknown> | undefined,
  fallback: RateLimitStore,
): RateLimitStore {
  return {
    async hit(key, group) {
      const binding = bindings()?.[bindingNames[group]] as RateLimitBinding | undefined;
      if (!binding) return fallback.hit(key, group);
      let success: boolean;
      try {
        ({ success } = await binding.limit({ key }));
      } catch {
        return fallback.hit(key, group);
      }
      if (success) return { allowed: true };
      return { allowed: false, retryAfterSeconds: limits[group].windowMs / 1000 };
    },
  };
}

/** The Worker's bindings, or nothing outside the Worker (`next dev`, tests). */
function workerBindings(): Record<string, unknown> | undefined {
  try {
    return getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

let store: RateLimitStore = createBindingStore(workerBindings, createMemoryStore());

/** Replace the store, for tests. */
export function setRateLimitStore(next: RateLimitStore) {
  store = next;
}

const MAX_ID_LENGTH = 64;

/**
 * Who is asking: Cloudflare's `cf-connecting-ip`, which Cloudflare sets and a client can't forge.
 * Outside production the first `x-forwarded-for` entry or `x-real-ip` will also do. In production
 * those are ignored, because a client could dodge limits or use up someone else's by sending them.
 * With none of these, everyone shares one `unknown` bucket. Never log the result.
 */
export function clientIdFrom(headers: Headers): string {
  const candidates = [headers.get("cf-connecting-ip")];
  if (process.env.NODE_ENV !== "production") {
    candidates.push(
      headers.get("x-forwarded-for")?.split(",")[0] ?? null,
      headers.get("x-real-ip"),
    );
  }
  for (const candidate of candidates) {
    const id = candidate?.trim().slice(0, MAX_ID_LENGTH);
    if (id) return `ip:${id}`;
  }
  return "ip:unknown";
}

/** Counts one request. */
export function rateLimit(key: string, group: LimitGroup): Promise<RateLimitResult> {
  return store.hit(key, group);
}
