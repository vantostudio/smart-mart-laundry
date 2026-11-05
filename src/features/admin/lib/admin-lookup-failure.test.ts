import { inspect } from "node:util";

import type { NeonQueryFunction } from "@neondatabase/serverless";
import { DrizzleQueryError, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vite-plus/test";

import { SignInPanel } from "@/features/admin/components/sign-in-panel";
import type { Db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { AppError } from "@/lib/errors";

import { requireAdmin, requireAdminForAction, resolveAdmin } from "./auth";
import type { SessionUser } from "./neon-auth";

const mocks = vi.hoisted(() => ({
  readSession: vi.fn<() => Promise<SessionUser | null>>(),
  getDb: vi.fn<() => Db>(),
}));

vi.mock("server-only", () => ({}));
// The SDK imports `next/headers` in a way Node can't resolve outside Next.
vi.mock("@neon/auth/next/server", () => ({ createNeonAuth: vi.fn<() => never>() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn<() => never>(), unstable_rethrow: () => {} }));
vi.mock("@/lib/request-id", () => ({ getRequestId: () => Promise.resolve("req-7") }));
vi.mock("@/lib/db", () => ({ getDb: mocks.getDb }));
vi.mock("./neon-auth", () => ({ readSession: mocks.readSession }));

const EMAIL = "outsider.person@gmail.com";
const session: SessionUser = { email: EMAIL, emailVerified: true, name: null };

/** The real neon-http Drizzle over a client that fails, so the wrapped error is the real one. */
function failingDb(): Db {
  const driverError = Object.assign(new Error(`Key (email)=(${EMAIL}) broke`), {
    name: "NeonDbError",
    code: "57P01",
  });
  const client = () => Promise.reject(driverError);
  return drizzle({ client: client as unknown as NeonQueryFunction<false, false>, schema });
}

/** Everything the error holds, the way Node prints it, and every line that went to the logs. */
const everythingOut = (thrown: unknown, lines: unknown[][]) =>
  `${inspect(thrown, { depth: 10, showHidden: true })}\n${lines.join("\n")}`;

let error: MockInstance<typeof console.error>;

beforeEach(() => {
  error = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.readSession.mockReset().mockResolvedValue(session);
  mocks.getDb.mockReset().mockImplementation(failingDb);
});

afterEach(() => {
  vi.restoreAllMocks();
});

const logged = () => error.mock.calls.map((call) => JSON.parse(String(call[0])) as object);

describe("a failed admin_user lookup", () => {
  it("really does carry the email in Drizzle's error", async () => {
    const query = failingDb()
      .select()
      .from(schema.adminUser)
      .where(eq(schema.adminUser.email, EMAIL));
    const failure = await query.then(
      () => null,
      (err: unknown) => err,
    );
    expect(failure).toBeInstanceOf(DrizzleQueryError);
    expect((failure as Error).message).toContain(EMAIL);
  });

  it("throws a fixed INTERNAL error that holds no email", async () => {
    const thrown = await resolveAdmin({
      readSession: mocks.readSession,
      db: failingDb,
      requestId: "req-1",
    }).catch((err: unknown) => err);

    expect(thrown).toBeInstanceOf(AppError);
    expect(thrown).toMatchObject({ code: "INTERNAL", message: "Internal error" });
    expect((thrown as Error).cause).toBeUndefined();
    expect(everythingOut(thrown, error.mock.calls)).not.toContain("outsider");
  });

  it("logs only the driver error's name and code", async () => {
    await resolveAdmin({
      readSession: mocks.readSession,
      db: failingDb,
      requestId: "req-1",
    }).catch(() => {});

    expect(logged()).toEqual([
      {
        level: "error",
        msg: "admin_lookup_failed",
        requestId: "req-1",
        errorName: "NeonDbError",
        errorCode: "57P01",
      },
    ]);
  });

  it("keeps the email out of the admin_check_failed path", async () => {
    const thrown = await requireAdmin().catch((err: unknown) => err);

    expect(thrown).toBeInstanceOf(AppError);
    expect(logged().map((line) => (line as { msg: string }).msg)).toEqual([
      "admin_lookup_failed",
      "admin_check_failed",
    ]);
    expect(everythingOut(thrown, error.mock.calls)).not.toContain("outsider");
  });

  it("keeps the email out of the sign_in_check_failed path", async () => {
    const thrown = await SignInPanel({ searchParams: Promise.resolve({}) }).catch(
      (err: unknown) => err,
    );

    expect(thrown).toBeInstanceOf(AppError);
    expect(logged().map((line) => (line as { msg: string }).msg)).toEqual([
      "admin_lookup_failed",
      "sign_in_check_failed",
    ]);
    expect(everythingOut(thrown, error.mock.calls)).not.toContain("outsider");
  });

  it("answers an action with INTERNAL and no email", async () => {
    const result = await requireAdminForAction();

    expect(result).toEqual({
      ok: false,
      error: { code: "INTERNAL", message: "Internal error", requestId: "req-7" },
    });
    expect(everythingOut(result, error.mock.calls)).not.toContain("outsider");
  });

  it("still reads a database that isn't configured as unavailable", async () => {
    const unavailable = new AppError("AUTH_UNAVAILABLE", "down");
    const thrown = await resolveAdmin({
      readSession: mocks.readSession,
      db: () => {
        throw unavailable;
      },
      requestId: "req-1",
    }).catch((err: unknown) => err);

    expect(thrown).toBe(unavailable);
    expect(error).not.toHaveBeenCalled();
  });
});
