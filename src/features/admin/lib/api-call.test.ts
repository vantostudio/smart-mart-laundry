import { describe, expect, it } from "vite-plus/test";

import { errorMessages } from "@/features/admin/messages";

import { problemFrom } from "./api-call";

describe("problemFrom", () => {
  it("shows the plain message for a rate-limited request", () => {
    expect(
      problemFrom({ code: "RATE_LIMITED", message: errorMessages.RATE_LIMITED, requestId: "r" })
        .message,
    ).toBe("That was a lot of requests. Please wait a moment and try again.");
  });
});
