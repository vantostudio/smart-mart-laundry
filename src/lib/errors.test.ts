import { describe, expect, it } from "vite-plus/test";

import { AppError, appErrorCodes, toErrorShape } from "./errors";

describe("toErrorShape", () => {
  it("passes an AppError through with its field and the request id", () => {
    const err = new AppError("VALIDATION", "That email address doesn't look right.", {
      field: "email",
    });
    expect(toErrorShape(err, "req-1")).toEqual({
      code: "VALIDATION",
      message: "That email address doesn't look right.",
      field: "email",
      requestId: "req-1",
    });
  });

  it("leaves field off when the AppError has none", () => {
    const shape = toErrorShape(new AppError("NOT_FOUND", "Not found."), "req-2");
    expect(shape).toEqual({ code: "NOT_FOUND", message: "Not found.", requestId: "req-2" });
    expect("field" in shape).toBe(false);
  });

  it("maps anything else to INTERNAL with no text from the original", () => {
    for (const err of [new Error("select * from secret"), "select * from secret", undefined]) {
      const shape = toErrorShape(err, "req-3");
      expect(shape).toEqual({ code: "INTERNAL", message: "Internal error", requestId: "req-3" });
      expect(JSON.stringify(shape)).not.toContain("select");
    }
  });

  it("lists every code once", () => {
    expect(new Set(appErrorCodes).size).toBe(appErrorCodes.length);
    expect(appErrorCodes).toContain("AUTH_UNAVAILABLE");
  });
});
