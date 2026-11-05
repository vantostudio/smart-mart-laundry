import { describe, expect, it } from "vite-plus/test";

import { fitWithin } from "./shrink-image";

describe("fitWithin", () => {
  it("shrinks the longest side and keeps the shape", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1600, height: 1200 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: 1600 });
  });

  it("never enlarges a small photo", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
