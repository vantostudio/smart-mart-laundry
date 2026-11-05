import "server-only";

/*
 * A basic guard against floods, applied by `publicRoute` and `adminRoute` so no route can forget it.
 *
 * Be clear about what it is: the default store lives in the memory of one Worker instance. Each
 * instance counts on its own and forgets everything when it restarts, so the real ceiling is the
 * limit times the number of instances. It stops a runaway script or a stuck retry loop, not a
 * determined attacker. At deployment, add a Cloudflare Rate Limiting binding and swap the store
 * with `setRateLimitStore` (see README); routes don't change. The database is deliberately not
 * the store: the point is to keep traffic away from Neon so it can sleep.
 */

type Limit = { max: number; windowMs: number };

/**
 * Requests allowed per window, per client (or per signed-in person for admin groups). Public reads
 * are generous because many shoppers share one mobile carrier IP, and one shopper's typing
 * (debounced 300ms), filters, Show more and item views add up to well under 30 a minute.
 */
export const limits = {
  /** Public product reads. */
  read: { max: 120, windowMs: 60_000 },
  /** Shop settings: one per page load, so its budget is separate from product reads. */
  settings: { max: 120, windowMs: 60_000 },
  /** Any admin request by IP, before auth work. Generous: all staff may share the shop's IP. */
  adminGate: { max: 300, windowMs: 60_000 },
  /** Admin GETs, per person. */
  adminRead: { max: 120, windowMs: 60_000 },
  /** Admin writes, per person. */
  write: { max: 60, windowMs: 60_000 },
  /** Photo uploads, per person. */
  upload: { max: 30, windowMs: 60_000 },
} as const satisfies Record<string, Limit>;

export type LimitGroup = keyof typeof limits;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/** The one thing a store does. A Cloudflare Rate Limiting binding can implement it. */
export type RateLimitStore = {
  hit(key: string, group: LimitGroup): Promise<RateLimitResult>;
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

let store: RateLimitStore = createMemoryStore();

/** Replace the store, for the Cloudflare binding at deployment and for tests. */
export function setRateLimitStore(next: RateLimitStore) {
  store = next;
}

const MAX_ID_LENGTH = 64;

/**
 * Who is asking: Cloudflare's `cf-connecting-ip`, else the first `x-forwarded-for` entry, else
 * `x-real-ip`, else one shared `unknown` bucket. Only `cf-connecting-ip` can be trusted (Cloudflare
 * sets it); the others can be forged when nothing sits in front of the app. Never log the result.
 */
export function clientIdFrom(headers: Headers): string {
  const candidates = [
    headers.get("cf-connecting-ip"),
    headers.get("x-forwarded-for")?.split(",")[0],
    headers.get("x-real-ip"),
  ];
  for (const candidate of candidates) {
    const id = candidate?.trim().slice(0, MAX_ID_LENGTH);
    if (id) return `ip:${id}`;
  }
  return "ip:unknown";
}

/** Counts one request. `RATE_LIMIT_OFF=1` turns it off for local e2e runs; never set it in production. */
export function rateLimit(key: string, group: LimitGroup): Promise<RateLimitResult> {
  if (process.env.RATE_LIMIT_OFF === "1") return Promise.resolve({ allowed: true });
  return store.hit(key, group);
}
