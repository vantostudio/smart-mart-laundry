import { describe, expect, it, vi } from "vite-plus/test";

vi.mock("server-only", () => ({}));

const { clientIdFrom, createMemoryStore, limits } = await import("./rate-limit");

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
