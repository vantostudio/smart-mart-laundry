import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vite-plus/test";

import { AppError } from "@/lib/errors";

const mocks = vi.hoisted(() => ({
  createNeonAuth: vi.fn<(config: unknown) => unknown>(),
  getSession: vi.fn<(args?: unknown) => Promise<unknown>>(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@neon/auth/next/server", () => ({ createNeonAuth: mocks.createNeonAuth }));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-3" }));

const names = ["NEON_AUTH_BASE_URL", "NEON_AUTH_COOKIE_SECRET"] as const;
const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));

const baseUrl = "https://ep-secret-host.neonauth.example/neondb/auth";
const secret = "s".repeat(32);

function setEnv(values: { url?: string; secret?: string }) {
  if (values.url !== undefined) process.env.NEON_AUTH_BASE_URL = values.url;
  if (values.secret !== undefined) process.env.NEON_AUTH_COOKIE_SECRET = values.secret;
}

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  for (const name of names) delete process.env[name];
  mocks.createNeonAuth.mockReset().mockImplementation(() => ({ getSession: mocks.getSession }));
  mocks.getSession.mockReset();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  for (const name of names) {
    if (saved[name] === undefined) delete process.env[name];
    else process.env[name] = saved[name];
  }
  vi.restoreAllMocks();
});

function thrown(fn: () => unknown): unknown {
  try {
    fn();
  } catch (err) {
    return err;
  }
  return undefined;
}

const session = { id: "s1", token: "tok-secret", userId: "u1" };
const user = {
  id: "u1",
  email: "Owner@Example.com",
  emailVerified: true,
  name: "Mo",
  image: null,
};

function warnLines(): Record<string, unknown>[] {
  return warn.mock.calls.map((call) => JSON.parse(String(call[0])) as Record<string, unknown>);
}

describe("getNeonAuth", () => {
  // The first import loads Zod and React, which takes seconds on a busy machine.
  it("can be imported with no env, without creating the SDK", async () => {
    await expect(import("./neon-auth")).resolves.toHaveProperty("getNeonAuth");
    expect(mocks.createNeonAuth).not.toHaveBeenCalled();
  }, 30_000);

  it("throws AUTH_UNAVAILABLE with no env", async () => {
    const { getNeonAuth } = await import("./neon-auth");
    const err = thrown(getNeonAuth);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ code: "AUTH_UNAVAILABLE" });
    expect(mocks.createNeonAuth).not.toHaveBeenCalled();
  });

  it("throws AUTH_UNAVAILABLE for a 31-character secret, without echoing values", async () => {
    const { getNeonAuth } = await import("./neon-auth");
    setEnv({ url: baseUrl, secret: "x".repeat(31) });
    const err = thrown(getNeonAuth) as AppError;
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("AUTH_UNAVAILABLE");
    expect(err.message).toContain("NEON_AUTH_COOKIE_SECRET");
    expect(err.message).not.toContain("xxx");
    expect(err.message).not.toContain("secret-host");
    expect(mocks.createNeonAuth).not.toHaveBeenCalled();
  });

  it("creates the SDK from the env with its default cookie options", async () => {
    const { getNeonAuth } = await import("./neon-auth");
    setEnv({ url: baseUrl, secret });
    getNeonAuth();
    expect(mocks.createNeonAuth).toHaveBeenCalledWith({ baseUrl, cookies: { secret } });
  });
});

describe("readSession", () => {
  beforeEach(() => {
    setEnv({ url: baseUrl, secret });
  });

  it("maps a session to the email, verified flag and name, with refresh off", async () => {
    const { readSession } = await import("./neon-auth");
    mocks.getSession.mockResolvedValue({ data: { session, user }, error: null });
    await expect(readSession()).resolves.toEqual({
      email: "Owner@Example.com",
      emailVerified: true,
      name: "Mo",
    });
    expect(mocks.getSession).toHaveBeenCalledWith({ query: { disableRefresh: "true" } });
  });

  it("reads anything but a strict true as unverified, and an empty name as null", async () => {
    const { readSession } = await import("./neon-auth");
    mocks.getSession.mockResolvedValue({
      data: { session, user: { ...user, emailVerified: "true", name: "" } },
      error: null,
    });
    await expect(readSession()).resolves.toEqual({
      email: "Owner@Example.com",
      emailVerified: false,
      name: null,
    });
  });

  it("returns null for null data, a missing session or user, and a 401", async () => {
    const { readSession } = await import("./neon-auth");
    for (const result of [
      { data: null, error: null },
      { data: { session: null, user: null }, error: null },
      { data: { session, user: null }, error: null },
      { data: null, error: { status: 401, message: "Unauthorized", statusText: "", code: "x" } },
    ]) {
      mocks.getSession.mockResolvedValue(result);
      await expect(readSession()).resolves.toBeNull();
    }
    expect(warn).not.toHaveBeenCalled();
  });

  it("throws AUTH_UNAVAILABLE for a 502 and logs only the status", async () => {
    const { readSession } = await import("./neon-auth");
    mocks.getSession.mockResolvedValue({
      data: null,
      error: { status: 502, message: "fetch failed: sdk-detail", statusText: "Bad Gateway" },
    });
    await expect(readSession()).rejects.toMatchObject({ code: "AUTH_UNAVAILABLE" });
    expect(warnLines()).toEqual([
      { level: "warn", msg: "auth_session_unavailable", requestId: "req-3", status: 502 },
    ]);
    expect(JSON.stringify(warnLines())).not.toContain("sdk-detail");
  });

  it("throws AUTH_UNAVAILABLE when the SDK throws, without its text", async () => {
    const { readSession } = await import("./neon-auth");
    mocks.getSession.mockRejectedValue(new Error("sdk-detail tok-secret"));
    const err = await readSession().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(AppError);
    expect(err).toMatchObject({ code: "AUTH_UNAVAILABLE" });
    expect((err as AppError).message).not.toContain("sdk-detail");
    expect(warnLines()).toEqual([
      { level: "warn", msg: "auth_session_unavailable", requestId: "req-3", status: null },
    ]);
    expect(JSON.stringify(warnLines())).not.toContain("sdk-detail");
  });

  it("returns null when Next refuses the SDK's cookie clean-up during a render", async () => {
    const { readSession } = await import("./neon-auth");
    mocks.getSession.mockRejectedValue(
      new Error(
        "Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options",
      ),
    );
    await expect(readSession()).resolves.toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});
