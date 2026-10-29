import { describe, expect, it } from "vite-plus/test";

import { productByCode, SHOP_DELIVERY } from "@/features/shop/data";

import { bagLine, buildShopMessage, validateShopOrder } from "./shop-message";

const jacket = productByCode("SM-1001")!;
const tee = productByCode("SM-1005")!;
const lines = [
  { ...bagLine(jacket, "M"), qty: 1 },
  { ...bagLine(tee, "L"), qty: 2 },
];
const details = {
  method: "delivery" as const,
  location: "Ndagani",
  name: "Wanjiru",
  phone: "0712345678",
};

describe("buildShopMessage", () => {
  it("lists each line with its code and size, then the totals", () => {
    const message = buildShopMessage(lines, details);
    expect(message).toContain("• 1 × Light denim jacket (SM-1001 · Size M) — KSh 1,200");
    expect(message).toContain("• 2 × Plain white tee (SM-1005 · Size L) — KSh 900");
    expect(message).toContain("Subtotal: KSh 2,100");
    expect(message).toContain("Delivery: Free");
    expect(message).toContain("Total: KSh 2,100");
    expect(message).toContain("Location: Ndagani");
    expect(message).toContain("Please confirm these are still available.");
  });

  it("adds the fee under the threshold", () => {
    const message = buildShopMessage([{ ...bagLine(tee, "M"), qty: 1 }], details);
    expect(message).toContain(`Delivery: KSh ${SHOP_DELIVERY.fee}`);
    expect(message).toContain(`Total: KSh ${450 + SHOP_DELIVERY.fee}`);
  });

  it("skips location and delivery for pick up", () => {
    const message = buildShopMessage(lines, { ...details, method: "pickup", location: "" });
    expect(message).toContain("Pick up in store");
    expect(message).not.toContain("Location:");
    expect(message).not.toContain("Delivery:");
    expect(message).toContain("I'll pay at the shop");
  });
});

describe("validateShopOrder", () => {
  it("needs a location only for delivery", () => {
    const none = { ...details, location: "" };
    expect(validateShopOrder(1, none).location).toBeDefined();
    expect(validateShopOrder(1, { ...none, method: "pickup" })).toEqual({});
  });

  it("checks items, name and phone in form order", () => {
    expect(Object.keys(validateShopOrder(0, { ...details, name: "", phone: "123" }))).toEqual([
      "items",
      "name",
      "phone",
    ]);
  });

  it("caps a mtumba line at one piece", () => {
    expect(bagLine(jacket, "M").max).toBe(1);
  });
});
