import { describe, expect, it } from "vite-plus/test";

import { errorMessages, signInMessages, signInReasonMessage, signInReasons } from "./messages";

describe("signInReasonMessage", () => {
  it("maps every allowlisted reason to its copy", () => {
    expect(signInReasons.map((r) => signInReasonMessage(r))).toEqual([
      "Please sign in to continue.",
      "This Google account isn't on the Street Mart team. Ask the owner to add your email, then sign in again.",
      "Sign-in isn't available right now. Please try again in a few minutes.",
      signInMessages.cancelled,
    ]);
    expect(signInMessages.cancelled).toBe("Sign-in was cancelled. Try again.");
  });

  it.each([
    ["an unknown string", "NOT_A_CODE"],
    ["markup", "<img src=x>"],
    ["an array", ["FORBIDDEN"]],
    ["undefined", undefined],
    ["an empty string", ""],
    ["a lowercase code", "forbidden"],
    ["a prototype key", "constructor"],
    ["a code with spaces", " FORBIDDEN"],
  ])("returns null for %s", (_, reason) => {
    expect(signInReasonMessage(reason)).toBeNull();
  });
});

describe("errorMessages", () => {
  it("puts the request id into the INTERNAL copy", () => {
    expect(errorMessages.INTERNAL("ray-42")).toBe(
      "That didn't save. Please try again. If it keeps happening, tell the owner and quote code ray-42.",
    );
  });
});
