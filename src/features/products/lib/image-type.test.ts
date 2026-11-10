import { describe, expect, it } from "vite-plus/test";

import { imageTypeOf } from "./image-type";

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

describe("imageTypeOf", () => {
  it("knows a JPEG, a PNG and a WebP", () => {
    expect(imageTypeOf(bytes(0xff, 0xd8, 0xff, 0xe0))?.extension).toBe("jpg");
    expect(imageTypeOf(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))?.extension).toBe(
      "png",
    );
    expect(imageTypeOf(text("RIFF....WEBPVP8 "))?.extension).toBe("webp");
  });

  it("refuses anything else, even something that nearly matches", () => {
    expect(imageTypeOf(text("<svg onload=alert(1)>"))).toBeNull();
    expect(imageTypeOf(text("RIFF....WAVEfmt "))).toBeNull();
    expect(imageTypeOf(bytes())).toBeNull();
  });
});
