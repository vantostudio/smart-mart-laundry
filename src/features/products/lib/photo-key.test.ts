import { describe, expect, it } from "vite-plus/test";

import { isPhotoKey, photoPath, thumbnailKey } from "./image-keys";

const id = "0f8b2c4e-9a1d-4e7f-b3c5-6d2a8e9f1b07";

describe("isPhotoKey", () => {
  it("accepts the keys the upload makes, and their thumbnails", () => {
    for (const extension of ["webp", "jpg", "png"]) {
      const key = `products/${crypto.randomUUID()}.${extension}`;
      expect(isPhotoKey(key)).toBe(true);
      expect(isPhotoKey(thumbnailKey(key))).toBe(true);
    }
  });

  it.each([
    ["traversal", `products/../${id}.webp`],
    ["traversal in the name", `products/${id}..webp`],
    ["an encoded dot", `products/%2e%2e/${id}.webp`],
    ["an encoded slash", `products%2F${id}.webp`],
    ["another prefix", `laundry/${id}.webp`],
    ["a leading slash", `/products/${id}.webp`],
    ["a gif", `products/${id}.gif`],
    ["an svg", `products/${id}.svg`],
    ["a double extension", `products/${id}.webp.html`],
    ["uppercase hex", `products/${id.toUpperCase()}.webp`],
    ["an uppercase extension", `products/${id}.WEBP`],
    ["a trailing slash", `products/${id}.webp/`],
    ["a query string", `products/${id}.webp?x=1`],
    ["the empty string", ""],
  ])("rejects %s", (_name, key) => {
    expect(isPhotoKey(key)).toBe(false);
  });
});

describe("photoPath", () => {
  it("is the same-site address", () => {
    expect(photoPath(`products/${id}.webp`)).toBe(`/photos/products/${id}.webp`);
  });
});
