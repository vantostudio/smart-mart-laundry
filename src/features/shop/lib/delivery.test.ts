import { describe, expect, it } from "vite-plus/test";

import { SHOP_DELIVERY } from "@/features/shop/data";

import { deliveryFor } from "./delivery";

describe("deliveryFor", () => {
  it("charges the fee under the threshold and says how much more makes it free", () => {
    expect(deliveryFor(1200, "delivery")).toEqual({
      fee: SHOP_DELIVERY.fee,
      free: false,
      remaining: SHOP_DELIVERY.freeFrom - 1200,
    });
  });

  it("is free from the threshold up", () => {
    expect(deliveryFor(SHOP_DELIVERY.freeFrom, "delivery")).toEqual({
      fee: 0,
      free: true,
      remaining: 0,
    });
  });

  it("costs nothing for pick up or an empty bag", () => {
    expect(deliveryFor(200, "pickup").fee).toBe(0);
    expect(deliveryFor(0, "delivery").fee).toBe(0);
  });
});
