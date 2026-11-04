import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

vi.mock("server-only", () => ({}));

const saved = process.env.DATABASE_URL;

beforeEach(() => {
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  if (saved === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = saved;
  vi.unstubAllGlobals();
});

describe("@/lib/db", () => {
  // The first import loads the driver, which takes seconds on a busy machine.
  it("can be imported with no env", async () => {
    await expect(import("@/lib/db")).resolves.toHaveProperty("getDb");
  }, 30_000);

  it("getDb throws AUTH_UNAVAILABLE when DATABASE_URL is unset", async () => {
    const { getDb } = await import("@/lib/db");
    expect(() => getDb()).toThrow(expect.objectContaining({ code: "AUTH_UNAVAILABLE" }));
  });

  it("createDb builds a client without a network call", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    vi.stubGlobal("fetch", fetch);
    const { createDb } = await import("@/lib/db");
    const db = createDb("postgresql://u:p@example.invalid/db");
    expect(db).toHaveProperty("select");
    expect(fetch).not.toHaveBeenCalled();
  });
});
