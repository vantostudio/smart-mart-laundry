import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vite-plus/test";

import type { RateLimitBinding, RateLimitStore } from "./rate-limit";

vi.mock("server-only", () => ({}));

const { bindingNames, clientIdFrom, createBindingStore, createMemoryStore, limits } =
  await import("./rate-limit");

type RateLimitConfig = {
  name: string;
  namespace_id: string;
  simple: { limit: number; period: number };
};

function clock(start = 1_000_000) {
  let t = start;
  return { now: () => t, advance: (ms: number) => (t += ms) };
}

describe("memory store", () => {
  it("allows up to the limit, then says how long to wait", async () => {
    const time = clock();
    const store = createMemoryStore({ now: time.now });
    for (let i = 0; i < limits.upload.max; i++) {
      expect(await store.hit("a", "upload")).toEqual({ allowed: true });
    }
    time.advance(10_000);
    expect(await store.hit("a", "upload")).toEqual({ allowed: false, retryAfterSeconds: 50 });
  });

  it("starts a new window once the old one ends", async () => {
    const time = clock();
    const store = createMemoryStore({ now: time.now });
    for (let i = 0; i <= limits.upload.max; i++) await store.hit("a", "upload");
    time.advance(limits.upload.windowMs);
    expect(await store.hit("a", "upload")).toEqual({ allowed: true });
  });

  it("counts clients and groups separately", async () => {
    const store = createMemoryStore();
    for (let i = 0; i <= limits.upload.max; i++) await store.hit("a", "upload");
    expect((await store.hit("a", "upload")).allowed).toBe(false);
    expect((await store.hit("b", "upload")).allowed).toBe(true);
    expect((await store.hit("a", "write")).allowed).toBe(true);
  });

  it("stays within its size, sweeping expired entries before dropping live ones", async () => {
    const time = clock();
    const store = createMemoryStore({ maxEntries: 3, now: time.now });
    await store.hit("old", "write");
    time.advance(limits.write.windowMs);
    await store.hit("b", "write");
    await store.hit("c", "write");
    await store.hit("d", "write"); // full: "old" has expired and goes
    for (let i = 0; i < limits.write.max; i++) await store.hit("b", "write");
    expect((await store.hit("b", "write")).allowed).toBe(false);
    // Full of live entries: the oldest ("b", with its count) is dropped, so it starts fresh.
    await store.hit("e", "write");
    expect((await store.hit("b", "write")).allowed).toBe(true);
  });
});

describe("binding store", () => {
  type Limit = RateLimitBinding["limit"];
  const binding = (success: boolean) => ({ limit: vi.fn<Limit>(async () => ({ success })) });
  const memory = () => ({
    hit: vi.fn<RateLimitStore["hit"]>(async () => ({ allowed: true })),
  });

  it("asks the group's binding, keyed by client", async () => {
    const write = binding(true);
    const fallback = memory();
    const store = createBindingStore(() => ({ RATE_LIMIT_WRITE: write }), fallback);
    expect(await store.hit("ip:1.1.1.1", "write")).toEqual({ allowed: true });
    expect(write.limit).toHaveBeenCalledWith({ key: "ip:1.1.1.1" });
    expect(fallback.hit).not.toHaveBeenCalled();
  });

  it("refuses with the whole window as Retry-After", async () => {
    const store = createBindingStore(() => ({ RATE_LIMIT_UPLOAD: binding(false) }), memory());
    expect(await store.hit("a", "upload")).toEqual({ allowed: false, retryAfterSeconds: 60 });
  });

  it("falls back when there are no bindings, the group's is missing, or it throws", async () => {
    const fallback = memory();
    const broken = { limit: vi.fn<Limit>(async () => Promise.reject(new Error("down"))) };
    await createBindingStore(() => undefined, fallback).hit("a", "read");
    await createBindingStore(() => ({ RATE_LIMIT_WRITE: binding(true) }), fallback).hit(
      "a",
      "read",
    );
    await createBindingStore(() => ({ RATE_LIMIT_READ: broken }), fallback).hit("a", "read");
    expect(fallback.hit).toHaveBeenCalledTimes(3);
  });

  it("is declared in wrangler.jsonc with the limits table's numbers, in every environment", () => {
    const jsonc = readFileSync("wrangler.jsonc", "utf8")
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/,(\s*[}\]])/g, "$1");
    const config = JSON.parse(jsonc) as {
      ratelimits: RateLimitConfig[];
      env: Record<string, { ratelimits: RateLimitConfig[] }>;
    };
    const expected = Object.entries(limits).map(([group, { max, windowMs }]) => ({
      name: bindingNames[group as keyof typeof limits],
      simple: { limit: max, period: windowMs / 1000 },
    }));
    const environments = [config.ratelimits, ...Object.values(config.env).map((e) => e.ratelimits)];
    const ids = environments.flat().map((r) => r.namespace_id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const ratelimits of environments) {
      expect(ratelimits.map(({ name, simple }) => ({ name, simple }))).toEqual(expected);
    }
  });
});

describe("clientIdFrom", () => {
  const id = (headers: Record<string, string>) => clientIdFrom(new Headers(headers));

  it("ignores headers a client can forge in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(id({ "x-forwarded-for": "2.2.2.2", "x-real-ip": "4.4.4.4" })).toBe("ip:unknown");
    expect(id({ "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" })).toBe("ip:1.1.1.1");
    vi.unstubAllEnvs();
  });

  it("prefers cf-connecting-ip, then the first x-forwarded-for, then x-real-ip", () => {
    expect(
      id({
        "cf-connecting-ip": "1.1.1.1",
        "x-forwarded-for": "2.2.2.2, 3.3.3.3",
        "x-real-ip": "4.4.4.4",
      }),
    ).toBe("ip:1.1.1.1");
    expect(id({ "x-forwarded-for": "2.2.2.2, 3.3.3.3", "x-real-ip": "4.4.4.4" })).toBe(
      "ip:2.2.2.2",
    );
    expect(id({ "x-real-ip": "4.4.4.4" })).toBe("ip:4.4.4.4");
  });

  it("shares one bucket when nothing says who is asking", () => {
    expect(id({})).toBe("ip:unknown");
    expect(id({ "x-forwarded-for": " " })).toBe("ip:unknown");
  });
});
