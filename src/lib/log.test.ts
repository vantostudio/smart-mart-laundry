import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { log } from "./log";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.restoreAllMocks();
});

function lines(spy: { mock: { calls: unknown[][] } }) {
  return spy.mock.calls.map((call) => {
    expect(call).toHaveLength(1);
    return JSON.parse(call[0] as string) as Record<string, unknown>;
  });
}

describe("log", () => {
  it("writes one JSON line per call, on the matching console method", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    log.debug("d", { requestId: "r1" });
    log.info("i", { requestId: "r2", count: 3 });
    log.warn("w", { requestId: "r3" });
    log.error("e", { requestId: "r4" });

    expect(lines(out)).toEqual([
      { level: "debug", msg: "d", requestId: "r1" },
      { level: "info", msg: "i", requestId: "r2", count: 3 },
    ]);
    expect(lines(warn)).toEqual([{ level: "warn", msg: "w", requestId: "r3" }]);
    expect(lines(error)).toEqual([{ level: "error", msg: "e", requestId: "r4" }]);
  });

  it("includes adminId only when given", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    log.info("a", { requestId: "r", adminId: "admin-1" });
    log.info("b", { requestId: "r" });
    const [withAdmin, without] = lines(out);
    expect(withAdmin).toMatchObject({ adminId: "admin-1" });
    expect(without).not.toHaveProperty("adminId");
  });

  it("doesn't let extra fields overwrite level, msg or requestId", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    log.info("real", { requestId: "r", level: "error", msg: "fake" });
    expect(lines(out)[0]).toMatchObject({ level: "info", msg: "real", requestId: "r" });
  });

  it("serialises an Error with its message and stack", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    log.error("boom", { requestId: "r", err: new TypeError("bad thing") });
    const err = lines(error)[0]?.err as Record<string, unknown>;
    expect(err).toMatchObject({ name: "TypeError", message: "bad thing" });
    expect(err.stack).toEqual(expect.stringContaining("bad thing"));
  });

  it("still writes one valid line for circular or bigint fields", () => {
    const out = vi.spyOn(console, "log").mockImplementation(() => {});
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => log.info("c", { requestId: "r", circular })).not.toThrow();
    expect(() => log.info("b", { requestId: "r", big: 10n })).not.toThrow();
    expect(lines(out)).toMatchObject([
      { level: "info", msg: "c", requestId: "r" },
      { level: "info", msg: "b", requestId: "r" },
    ]);
  });
});
