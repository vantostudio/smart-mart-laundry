import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { z } from "zod";

import { AppError } from "@/lib/errors";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/features/admin/lib/auth", () => ({ requireAdminForAction: vi.fn() }));

const { requireAdminForAction } = await import("@/features/admin/lib/auth");
const { adminRoute, parseBody, parseQuery } = await import("./api");

const admin = { adminId: "a", email: "a@example.com", name: null, role: "admin" as const };
const allow = vi.mocked(requireAdminForAction);

const ok = adminRoute(async () => Response.json({ done: true }));

function post(headers: Record<string, string>) {
  return new Request("http://shop.test/api/admin/x", { method: "POST", headers });
}

const sameSite = { origin: "http://shop.test", host: "shop.test" };

beforeEach(() => {
  allow.mockReset();
  allow.mockResolvedValue({ ok: true, admin });
});

describe("adminRoute", () => {
  it("runs the handler for an admin and never lets it be cached", async () => {
    const res = await ok(post(sameSite), undefined);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("hands the handler the admin", async () => {
    const seen = vi.fn(async () => new Response(null, { status: 204 }));
    await adminRoute(seen)(post(sameSite), undefined);
    expect(seen).toHaveBeenCalledWith(expect.objectContaining({ admin }));
  });

  it.each([
    ["UNAUTHENTICATED", 401],
    ["FORBIDDEN", 403],
    ["AUTH_UNAVAILABLE", 503],
  ] as const)("answers %s with %i and doesn't run the handler", async (code, status) => {
    const handler = vi.fn(async () => new Response());
    allow.mockResolvedValue({ ok: false, error: { code, message: "no", requestId: "req-1" } });
    const res = await adminRoute(handler)(post(sameSite), undefined);
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ error: { code, message: "no", requestId: "req-1" } });
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(handler).not.toHaveBeenCalled();
  });

  it.each([
    ["another site", { origin: "http://evil.test", host: "shop.test" }],
    ["no Origin", { host: "shop.test" }],
    ["Origin null", { origin: "null", host: "shop.test" }],
  ])("refuses a write from %s before the access check", async (_label, headers) => {
    const res = await ok(post(headers), undefined);
    expect(res.status).toBe(403);
    expect(allow).not.toHaveBeenCalled();
  });

  it("trusts the forwarded host behind a proxy", async () => {
    const headers = { origin: "http://shop.test", host: "worker", "x-forwarded-host": "shop.test" };
    expect((await ok(post(headers), undefined)).status).toBe(200);
  });

  it("lets a read through with no Origin", async () => {
    const res = await ok(new Request("http://shop.test/api/admin/x"), undefined);
    expect(res.status).toBe(200);
  });

  it.each([
    ["VALIDATION", 400],
    ["NOT_FOUND", 404],
  ] as const)("maps a thrown %s to %i", async (code, status) => {
    const route = adminRoute(async () => {
      throw new AppError(code, "Nope");
    });
    const res = await route(post(sameSite), undefined);
    expect(res.status).toBe(status);
    expect(await res.json()).toEqual({ error: { code, message: "Nope", requestId: "req-1" } });
  });

  it("keeps a failed query's values out of the response and the log", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const query = new Error("Failed query: insert params: secret-value", {
      cause: Object.assign(new Error("secret-value"), { name: "NeonDbError", code: "23505" }),
    });
    const route = adminRoute(async () => {
      throw query;
    });
    const res = await route(post(sameSite), undefined);

    expect(res.status).toBe(500);
    expect(await res.text()).not.toContain("secret-value");
    const line = String(error.mock.calls[0]?.[0]);
    expect(line).toContain("admin_api_failed");
    expect(line).toContain("23505");
    expect(line).not.toContain("secret-value");
    error.mockRestore();
  });
});

describe("parsing", () => {
  const schema = z.object({ n: z.number() }).strict();
  const body = (text: string) => new Request("http://shop.test/", { method: "POST", body: text });

  it("reads a valid body", async () => {
    expect(await parseBody(body(`{"n":1}`), schema)).toEqual({ n: 1 });
  });

  it("names the field, and doesn't echo what was sent", async () => {
    const err = await parseBody(body(`{"n":"sent-value"}`), schema).catch((e: unknown) => e);
    expect(err).toMatchObject({ code: "VALIDATION", field: "n" });
    expect((err as Error).message).not.toContain("sent-value");
  });

  it("refuses a body that isn't JSON", async () => {
    await expect(parseBody(body("{"), schema)).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("reads the query string", () => {
    const query = z.object({ page: z.coerce.number() });
    expect(parseQuery(new Request("http://shop.test/?page=2"), query)).toEqual({ page: 2 });
  });
});
