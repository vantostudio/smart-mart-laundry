import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { AppError } from "@/lib/errors";

vi.mock("server-only", () => ({}));

const names = ["DATABASE_URL", "NEON_AUTH_BASE_URL", "NEON_AUTH_COOKIE_SECRET"] as const;
const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));

beforeEach(() => {
  for (const name of names) delete process.env[name];
});

afterEach(() => {
  for (const name of names) {
    if (saved[name] === undefined) delete process.env[name];
    else process.env[name] = saved[name];
  }
});

function thrown(fn: () => unknown): AppError {
  let caught: unknown;
  try {
    fn();
  } catch (err) {
    caught = err;
  }
  expect(caught).toBeInstanceOf(AppError);
  return caught as AppError;
}

const url = "https://ep-cool-host.neonauth.example/neondb/auth";
const secret = "k".repeat(32);

describe("authEnv", () => {
  // The first import loads Zod and React, which takes seconds on a busy machine.
  it("can be imported with no env", async () => {
    await expect(import("./env")).resolves.toHaveProperty("authEnv");
  }, 30_000);

  it("throws AUTH_UNAVAILABLE naming both variables when they are unset", async () => {
    const { authEnv } = await import("./env");
    const err = thrown(authEnv);
    expect(err.code).toBe("AUTH_UNAVAILABLE");
    expect(err.message).toBe(
      "Server configuration is missing or invalid: NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET.",
    );
    expect(err.cause).toEqual({ variables: ["NEON_AUTH_BASE_URL", "NEON_AUTH_COOKIE_SECRET"] });
  });

  it("rejects an http URL without echoing it", async () => {
    const { authEnv } = await import("./env");
    process.env.NEON_AUTH_BASE_URL = "http://secret-host.example/auth";
    process.env.NEON_AUTH_COOKIE_SECRET = secret;
    const err = thrown(authEnv);
    expect(err.code).toBe("AUTH_UNAVAILABLE");
    expect(err.message).toContain("NEON_AUTH_BASE_URL");
    expect(err.message).not.toContain("NEON_AUTH_COOKIE_SECRET");
    expect(err.message).not.toContain("secret-host");
    expect(JSON.stringify(err.cause)).not.toContain("secret-host");
  });

  it("rejects a secret shorter than 32 characters without echoing it", async () => {
    const { authEnv } = await import("./env");
    process.env.NEON_AUTH_BASE_URL = url;
    process.env.NEON_AUTH_COOKIE_SECRET = "short-secret-value";
    const err = thrown(authEnv);
    expect(err.code).toBe("AUTH_UNAVAILABLE");
    expect(err.message).toContain("NEON_AUTH_COOKIE_SECRET");
    expect(err.message).not.toContain("short-secret-value");
    expect(JSON.stringify(err.cause)).not.toContain("short-secret-value");
  });

  it("returns valid values set after import", async () => {
    const { authEnv } = await import("./env");
    process.env.NEON_AUTH_BASE_URL = url;
    process.env.NEON_AUTH_COOKIE_SECRET = secret;
    expect(authEnv()).toEqual({ NEON_AUTH_BASE_URL: url, NEON_AUTH_COOKIE_SECRET: secret });
  });

  it("leaves serverEnv needing only DATABASE_URL", async () => {
    const { serverEnv } = await import("./env");
    process.env.DATABASE_URL = "postgresql://u:p@example.invalid/db";
    expect(serverEnv()).toEqual({ DATABASE_URL: "postgresql://u:p@example.invalid/db" });
  });
});
