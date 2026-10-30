import { describe, expect, it } from "vite-plus/test";

import { productByCode, SHOP_DELIVERY } from "@/features/shop/data";

import { bagLine, buildShopMessage, shopGaps } from "./shop-message";

const jacket = productByCode("SM-1001")!;
const tee = productByCode("SM-1005")!;
const lines = [
  { ...bagLine(jacket, "M"), qty: 1 },
  { ...bagLine(tee, "L"), qty: 2 },
];
const details = { method: "delivery" as const, area: "Ndagani" };

describe("buildShopMessage", () => {
  it("lists each line with its code and size, then the totals and area", () => {
    const message = buildShopMessage(lines, details);
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
    const message = buildShopMessage([{ ...bagLine(tee, "M"), qty: 1 }], details);
    expect(message).toContain(`Delivery: KSh ${SHOP_DELIVERY.fee}`);
    expect(message).toContain(`Total: KSh ${450 + SHOP_DELIVERY.fee}`);
  });

  it("skips the area and delivery for pick up, and adds a note when there is one", () => {
    const message = buildShopMessage(lines, {
      method: "pickup",
      area: null,
      note: " Size L if M is gone ",
    });
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

  it("caps a mtumba line at one piece", () => {
    expect(bagLine(jacket, "M").max).toBe(1);
  });
});
