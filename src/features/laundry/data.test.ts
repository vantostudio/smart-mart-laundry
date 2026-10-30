import { describe, expect, it } from "vite-plus/test";

import { laundryCategories, laundryItems } from "./data";

describe("laundry data", () => {
  it.each([...laundryItems, ...laundryCategories].map((i) => [i.id, i.image]))(
    "%s has a photo, so no card or rail button is empty",
    (_, image) => {
      expect(image).toMatch(/^photo-\d+-[0-9a-f]+$/);
    },
  );

  it.each(laundryCategories.map((c) => c.id))("%s has items", (id) => {
    expect(laundryItems.some((i) => i.category === id)).toBe(true);
  });

  it("has unique item ids", () => {
    expect(new Set(laundryItems.map((i) => i.id)).size).toBe(laundryItems.length);
  });
});
