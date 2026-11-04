import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vite-plus/test";

import type { Db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { createTestDb } from "@/lib/db/test-db";
import { AppError } from "@/lib/errors";

import { getAdmin, requireAdmin, requireAdminForAction } from "./auth";
import type { SessionUser } from "./neon-auth";

const mocks = vi.hoisted(() => ({
  readSession: vi.fn<() => Promise<SessionUser | null>>(),
  getDb: vi.fn<() => Db>(),
}));

/** What the mocked `redirect()` throws, as the real one does. */
class Redirected extends Error {
  constructor(readonly url: string) {
    super(`redirect ${url}`);
  }
}

vi.mock("server-only", () => ({}));
// The SDK imports `next/headers` in a way Node can't resolve outside Next.
vi.mock("@neon/auth/next/server", () => ({ createNeonAuth: vi.fn<() => never>() }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirected(url);
  },
  unstable_rethrow: () => {},
}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-7" }));
vi.mock("@/lib/db", () => ({ getDb: mocks.getDb }));
vi.mock("./neon-auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./neon-auth")>()),
  readSession: mocks.readSession,
}));

let t: Awaited<ReturnType<typeof createTestDb>>;

// One in-memory database per file: starting PGlite takes seconds on a busy machine.
beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

let error: MockInstance<typeof console.error>;

beforeEach(async () => {
  await t.client.exec("truncate admin_user");
  mocks.getDb.mockReset().mockImplementation(() => t.db);
  mocks.readSession.mockReset().mockResolvedValue(null);
  vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

async function addAdmin(email: string, role: "owner" | "admin") {
  const [row] = await t.db.insert(adminUser).values({ email, name: "Mo", role }).returning();
  return row!;
}

function signIn(email: string, emailVerified = true) {
  mocks.readSession.mockResolvedValue({ email, emailVerified, name: "Mo" });
}

const unavailable = () => new AppError("AUTH_UNAVAILABLE", "Server configuration is missing.");

/** The URL `requireAdmin` redirected to, or the error it threw. */
async function redirectOf(check: Promise<unknown>): Promise<string> {
  const err = await check.then(
    () => undefined,
    (e: unknown) => e,
  );
  if (!(err instanceof Redirected)) throw new Error(`expected a redirect, got ${String(err)}`);
  return err.url;
}

const signInUrl = (reason: string) => `/admin/sign-in?reason=${reason}`;

describe("requireAdmin", () => {
  it("redirects with UNAUTHENTICATED when there is no session", async () => {
    expect(await redirectOf(requireAdmin())).toBe(signInUrl("UNAUTHENTICATED"));
  });

  it("redirects with FORBIDDEN for an unknown verified email", async () => {
    await addAdmin("owner@example.com", "owner");
    signIn("stranger@example.com");
    expect(await redirectOf(requireAdmin())).toBe(signInUrl("FORBIDDEN"));
  });

  it("redirects with FORBIDDEN for an unverified email", async () => {
    await addAdmin("owner@example.com", "owner");
    signIn("owner@example.com", false);
    expect(await redirectOf(requireAdmin())).toBe(signInUrl("FORBIDDEN"));
  });

  it("returns the admin for an allowed session", async () => {
    const row = await addAdmin("staff@example.com", "admin");
    signIn("staff@example.com");
    await expect(requireAdmin()).resolves.toEqual({
      adminId: row.id,
      email: "staff@example.com",
      name: "Mo",
      role: "admin",
    });
  });

  it("redirects an admin row with FORBIDDEN when an owner is required", async () => {
    await addAdmin("staff@example.com", "admin");
    signIn("staff@example.com");
    expect(await redirectOf(requireAdmin({ role: "owner" }))).toBe(signInUrl("FORBIDDEN"));
  });

  it("returns an owner row when an owner is required", async () => {
    const row = await addAdmin("owner@example.com", "owner");
    signIn("owner@example.com");
    await expect(requireAdmin({ role: "owner" })).resolves.toMatchObject({
      adminId: row.id,
      role: "owner",
    });
  });

  it("redirects with AUTH_UNAVAILABLE when the session reader is unavailable", async () => {
    mocks.readSession.mockRejectedValue(unavailable());
    expect(await redirectOf(requireAdmin())).toBe(signInUrl("AUTH_UNAVAILABLE"));
  });

  it("redirects with AUTH_UNAVAILABLE when the database isn't configured", async () => {
    signIn("owner@example.com");
    mocks.getDb.mockImplementation(() => {
      throw unavailable();
    });
    expect(await redirectOf(requireAdmin())).toBe(signInUrl("AUTH_UNAVAILABLE"));
  });

  it("logs and rethrows any other error instead of redirecting", async () => {
    const failure = new Error("database exploded");
    mocks.readSession.mockRejectedValue(failure);
    await expect(requireAdmin()).rejects.toBe(failure);
    const logged = error.mock.calls.map((call) => JSON.parse(String(call[0])));
    expect(logged).toEqual([
      expect.objectContaining({ level: "error", msg: "admin_check_failed", requestId: "req-7" }),
    ]);
  });
});

describe("requireAdminForAction", () => {
  it("refuses with UNAUTHENTICATED when there is no session", async () => {
    await expect(requireAdminForAction()).resolves.toEqual({
      ok: false,
      error: {
        code: "UNAUTHENTICATED",
        message: "Please sign in to continue.",
        requestId: "req-7",
      },
    });
  });

  it("refuses a refused session with FORBIDDEN", async () => {
    signIn("stranger@example.com");
    await expect(requireAdminForAction()).resolves.toEqual({
      ok: false,
      error: { code: "FORBIDDEN", message: "You don't have access to this.", requestId: "req-7" },
    });
  });

  it("refuses a missing role with FORBIDDEN", async () => {
    await addAdmin("staff@example.com", "admin");
    signIn("staff@example.com");
    await expect(requireAdminForAction({ role: "owner" })).resolves.toEqual({
      ok: false,
      error: { code: "FORBIDDEN", message: "You don't have access to this.", requestId: "req-7" },
    });
  });

  it("refuses with AUTH_UNAVAILABLE when auth is unavailable", async () => {
    mocks.readSession.mockRejectedValue(unavailable());
    await expect(requireAdminForAction()).resolves.toEqual({
      ok: false,
      error: {
        code: "AUTH_UNAVAILABLE",
        message: "Sign-in isn't available right now. Please try again in a few minutes.",
        requestId: "req-7",
      },
    });
  });

  it("allows an admin", async () => {
    const row = await addAdmin("owner@example.com", "owner");
    signIn("owner@example.com");
    await expect(requireAdminForAction({ role: "owner" })).resolves.toEqual({
      ok: true,
      admin: { adminId: row.id, email: "owner@example.com", name: "Mo", role: "owner" },
    });
  });

  it("returns INTERNAL without the original error text for anything unexpected", async () => {
    mocks.readSession.mockRejectedValue(new Error("secret driver text"));
    const result = await requireAdminForAction();
    expect(result).toEqual({
      ok: false,
      error: { code: "INTERNAL", message: "Internal error", requestId: "req-7" },
    });
    expect(JSON.stringify(result)).not.toContain("secret");
    expect(error).toHaveBeenCalledTimes(1);
  });
});

describe("getAdmin", () => {
  it("returns null with no session", async () => {
    await expect(getAdmin()).resolves.toBeNull();
  });

  it("returns null for a refused session", async () => {
    signIn("stranger@example.com");
    await expect(getAdmin()).resolves.toBeNull();
  });

  it("returns the admin for an allowed session", async () => {
    const row = await addAdmin("owner@example.com", "owner");
    signIn("owner@example.com");
    await expect(getAdmin()).resolves.toEqual({
      adminId: row.id,
      email: "owner@example.com",
      name: "Mo",
      role: "owner",
    });
  });

  it("rejects with AUTH_UNAVAILABLE when the reader does", async () => {
    mocks.readSession.mockRejectedValue(unavailable());
    await expect(getAdmin()).rejects.toMatchObject({ code: "AUTH_UNAVAILABLE" });
  });
});
