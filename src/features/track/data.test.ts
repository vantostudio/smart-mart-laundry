import { describe, expect, it } from "vite-plus/test";

import { findTicket } from "./data";

describe("findTicket", () => {
  it("matches ticket numbers regardless of case and surrounding spaces", () => {
    expect(findTicket("  sm-48217 ")?.status).toBe("Washing");
  });

  it("returns undefined for unknown tickets", () => {
    expect(findTicket("SM-00000")).toBeUndefined();
  });
});
