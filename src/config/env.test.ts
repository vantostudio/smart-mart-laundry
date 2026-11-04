import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { AppError } from "@/lib/errors";

vi.mock("server-only", () => ({}));

const saved = process.env.DATABASE_URL;

beforeEach(() => {
  delete process.env.DATABASE_URL;
});

afterEach(() => {
  if (saved === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = saved;
});

function thrown(fn: () => unknown): unknown {
  try {
    fn();
  } catch (err) {
    return err;
  }
  return undefined;
}

describe("serverEnv", () => {
  // The first import loads Zod and React, which takes seconds on a busy machine.
  it("can be imported with no env", async () => {
    await expect(import("./env")).resolves.toHaveProperty("serverEnv");
  }, 30_000);

  it("throws AUTH_UNAVAILABLE when DATABASE_URL is unset", async () => {
    const { serverEnv } = await import("./env");
    const err = thrown(serverEnv);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({
      code: "AUTH_UNAVAILABLE",
      message: expect.stringContaining("DATABASE_URL"),
    });
  });

  it("throws AUTH_UNAVAILABLE for a URL that isn't postgres, without echoing it", async () => {
    const { serverEnv } = await import("./env");
    for (const value of ["https://secret-host.example/db", "not a url secret-value"]) {
      process.env.DATABASE_URL = value;
      const err = thrown(serverEnv) as AppError;
      expect(err).toBeInstanceOf(AppError);
      expect(err.code).toBe("AUTH_UNAVAILABLE");
      expect(err.message).not.toContain("secret");
      expect(JSON.stringify(err.cause)).not.toContain("secret");
    }
  });

  it("returns a valid DATABASE_URL, set after import", async () => {
    const { serverEnv } = await import("./env");
    process.env.DATABASE_URL = "postgresql://u:p@example.invalid/db";
    expect(serverEnv().DATABASE_URL).toBe("postgresql://u:p@example.invalid/db");
    process.env.DATABASE_URL = "postgres://u:p@other.invalid/db";
    expect(serverEnv().DATABASE_URL).toBe("postgres://u:p@other.invalid/db");
  });
});
