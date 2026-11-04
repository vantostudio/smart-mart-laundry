import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
  createNeonAuth: vi.fn<(config: unknown) => unknown>(),
  GET: vi.fn<(request: Request, ctx: unknown) => Promise<Response>>(),
  POST: vi.fn<(request: Request, ctx: unknown) => Promise<Response>>(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@neon/auth/next/server", () => ({ createNeonAuth: mocks.createNeonAuth }));

const names = ["NEON_AUTH_BASE_URL", "NEON_AUTH_COOKIE_SECRET"] as const;
const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));

let warn: MockInstance<typeof console.warn>;
let error: MockInstance<typeof console.error>;

beforeEach(() => {
  for (const name of names) delete process.env[name];
  mocks.createNeonAuth.mockReset().mockImplementation(() => ({
    handler: () => ({ GET: mocks.GET, POST: mocks.POST }),
  }));
  mocks.GET.mockReset();
  mocks.POST.mockReset();
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  for (const name of names) {
    if (saved[name] === undefined) delete process.env[name];
    else process.env[name] = saved[name];
  }
  vi.restoreAllMocks();
});

function setEnv() {
  process.env.NEON_AUTH_BASE_URL = "https://ep-host.neonauth.example/neondb/auth";
  process.env.NEON_AUTH_COOKIE_SECRET = "k".repeat(32);
}

const context = (path: string[]) => ({ params: Promise.resolve({ path }) });

describe("/api/auth/[...path]", () => {
  // The first import loads Zod and React, which takes seconds on a busy machine.
  it("answers 503 AUTH_UNAVAILABLE with no env", async () => {
    const { GET, POST } = await import("./route");
    const request = new Request("http://x/api/auth/get-session", {
      headers: { "cf-ray": "ray-1" },
    });
    const response = await GET(request, context(["get-session"]));
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "AUTH_UNAVAILABLE",
        message: "Sign-in isn't available right now. Please try again in a few minutes.",
        requestId: "ray-1",
      },
    });
    expect(warn.mock.calls.map((call) => JSON.parse(String(call[0])))).toEqual([
      { level: "warn", msg: "auth_unavailable", requestId: "ray-1" },
    ]);

    const post = await POST(
      new Request("http://x/api/auth/sign-out", { method: "POST" }),
      context(["sign-out"]),
    );
    expect(post.status).toBe(503);
    expect(post.headers.get("cache-control")).toBe("no-store");
    expect((await post.json()).error).toMatchObject({
      code: "AUTH_UNAVAILABLE",
      requestId: expect.any(String),
    });
    expect(mocks.createNeonAuth).not.toHaveBeenCalled();
  }, 30_000);

  it("delegates GET and POST to the SDK handler and returns its response unchanged", async () => {
    setEnv();
    const { GET, POST } = await import("./route");
    const sdkGet = new Response("{}", { status: 200, headers: { "set-cookie": "a=b" } });
    const sdkPost = new Response(null, { status: 302, headers: { location: "/x" } });
    mocks.GET.mockResolvedValue(sdkGet);
    mocks.POST.mockResolvedValue(sdkPost);

    const getRequest = new Request("http://x/api/auth/get-session");
    const getContext = context(["get-session"]);
    await expect(GET(getRequest, getContext)).resolves.toBe(sdkGet);
    expect(mocks.GET).toHaveBeenCalledWith(getRequest, getContext);

    const postRequest = new Request("http://x/api/auth/sign-in/social", { method: "POST" });
    const postContext = context(["sign-in", "social"]);
    await expect(POST(postRequest, postContext)).resolves.toBe(sdkPost);
    expect(mocks.POST).toHaveBeenCalledWith(postRequest, postContext);
    expect(mocks.GET).toHaveBeenCalledTimes(1);
  });

  it("answers 500 INTERNAL without the error text when the SDK throws", async () => {
    setEnv();
    const { GET } = await import("./route");
    mocks.GET.mockRejectedValue(new Error("sdk-detail"));
    const response = await GET(
      new Request("http://x/api/auth/get-session", { headers: { "cf-ray": "ray-2" } }),
      context(["get-session"]),
    );
    expect(response.status).toBe(500);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const body = await response.json();
    expect(body).toEqual({
      error: { code: "INTERNAL", message: "Internal error", requestId: "ray-2" },
    });
    expect(JSON.stringify(body)).not.toContain("sdk-detail");
    expect(error.mock.calls.map((call) => JSON.parse(String(call[0])))).toEqual([
      expect.objectContaining({ level: "error", msg: "auth_handler_failed", requestId: "ray-2" }),
    ]);
  });
});
