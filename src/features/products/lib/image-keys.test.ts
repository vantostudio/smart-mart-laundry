import { describe, expect, it } from "vite-plus/test";

import { thumbnailKey } from "./image-keys";

describe("thumbnailKey", () => {
  it("swaps the extension for -thumb", () => {
    const id = "00000000-0000-4000-8000-000000000000";
    expect(thumbnailKey(`products/${id}.webp`)).toBe(`products/${id}-thumb`);
    expect(thumbnailKey(`products/${id}.jpg`)).toBe(`products/${id}-thumb`);
  });
});
