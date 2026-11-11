import { describe, expect, it } from "vite-plus/test";

import { unsplash } from "@/lib/images";

import { laundryPhoto } from "./data";

describe("laundryPhoto", () => {
  it("uses a same-site path as it is", () => {
    const path = "/photos/products/0b5e6f3a-8d2c-4f1e-9a7b-3c4d5e6f7a8b-thumb";
    expect(laundryPhoto(path, 500)).toBe(path);
  });

  it("uses an https URL as it is", () => {
    const url = "https://photos.test/products/a-thumb";
    expect(laundryPhoto(url, 500)).toBe(url);
  });

  it("turns an Unsplash id into an Unsplash URL at the width asked for", () => {
    const id = "photo-1591130901959-9723d22a59ed";
    const url = laundryPhoto(id, 500);
    expect(url).toBe(unsplash(id, 500));
    expect(url).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(url).toMatch(/w=500$/);
  });
});
