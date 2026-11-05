import { describe, expect, it } from "vite-plus/test";

import type { PublicProduct } from "@/features/products/public";

import { bagLine, bagLineId, buildShopMessage, shopGaps } from "./shop-message";

const rates = { deliveryFee: 100, deliveryFreeFrom: 1500 };

const product = (values: Partial<PublicProduct>): PublicProduct => ({
  code: "SM-1001",
  name: "Light denim jacket",
  category: "ladies",
  condition: "mtumba",
  price: 1200,
  sizes: ["M"],
  stock: 1,
  photos: [],
  note: null,
  ...values,
});

const jacket = product({});
const tee = product({
  code: "SM-1005",
  name: "Plain white tee",
  condition: "new",
  price: 450,
  sizes: ["M", "L"],
  stock: 6,
});
const lines = [
  { ...bagLine(jacket, "M"), qty: 1 },
  { ...bagLine(tee, "L"), qty: 2 },
];
const details = { method: "delivery" as const, area: "Ndagani" };

describe("buildShopMessage", () => {
  it("lists each line with its code and size, then the totals and area", () => {
    const message = buildShopMessage(lines, details, rates);
    expect(message).toContain("• 1 × Light denim jacket (SM-1001 · Size M) — KSh 1,200");
    expect(message).toContain("• 2 × Plain white tee (SM-1005 · Size L) — KSh 900");
    expect(message).toContain("Subtotal: KSh 2,100");
    expect(message).toContain("Delivery: Free");
    expect(message).toContain("Total: KSh 2,100");
    expect(message).toContain("Area: Ndagani");
    expect(message).toContain("Please confirm these are still available.");
    // The message comes from the customer's own WhatsApp: no name or phone asked for.
    expect(message).not.toMatch(/Name:|Phone:/);
  });

  it("adds the fee under the threshold", () => {
    const message = buildShopMessage([{ ...bagLine(tee, "M"), qty: 1 }], details, rates);
    expect(message).toContain("Delivery: KSh 100");
    expect(message).toContain("Total: KSh 550");
  });

  it("skips the area and delivery for pick up, and adds a note when there is one", () => {
    const message = buildShopMessage(
      lines,
      { method: "pickup", area: null, note: " Size L if M is gone " },
      rates,
    );
    expect(message).toContain("Pick up in store");
    expect(message).not.toContain("Area:");
    expect(message).not.toContain("Delivery:");
    expect(message).toContain("Note: Size L if M is gone");
    expect(message).toContain("I'll pay at the shop");
  });
});

describe("shopGaps", () => {
  it("needs items, and an area only for delivery", () => {
    expect(shopGaps(0, { method: "delivery", area: null })).toEqual(["items", "area"]);
    expect(shopGaps(1, { method: "pickup", area: null })).toEqual([]);
    expect(shopGaps(1, details)).toEqual([]);
  });
});

describe("bagLine", () => {
  it("caps a line at the stock", () => {
    expect(bagLine(jacket, "M").max).toBe(1);
    expect(bagLine(tee, "M").max).toBe(6);
  });

  it("describes a one-size item by its code alone", () => {
    const tote = product({ code: "SM-1009", sizes: [] });
    expect(bagLine(tote, null)).toMatchObject({ id: "SM-1009:", detail: "SM-1009" });
    expect(bagLineId(tote, null)).toBe("SM-1009:");
  });

  it("keeps the main photo, or null when there is none", () => {
    expect(bagLine(product({ photos: ["a.webp", "b.webp"] }), "M").photo).toBe("a.webp");
    expect(bagLine(jacket, "M").photo).toBeNull();
  });
});
