import { describe, expect, it } from "vite-plus/test";

import { deliveryFor } from "./delivery";

const rates = { deliveryFee: 120, deliveryFreeFrom: 2000 };

describe("deliveryFor", () => {
  it("charges the fee under the threshold and says how much more makes it free", () => {
    expect(deliveryFor(1200, "delivery", rates)).toEqual({ fee: 120, free: false, remaining: 800 });
  });

  it("is free from the threshold up", () => {
    expect(deliveryFor(2000, "delivery", rates)).toEqual({ fee: 0, free: true, remaining: 0 });
  });

  it("costs nothing for pick up or an empty bag", () => {
    expect(deliveryFor(200, "pickup", rates).fee).toBe(0);
    expect(deliveryFor(0, "delivery", rates).fee).toBe(0);
  });
});
