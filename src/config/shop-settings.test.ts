import { describe, expect, it } from "vite-plus/test";

import {
  defaultShopSettings,
  hoursRows,
  openingHoursOf,
  phoneDisplay,
  phoneHref,
} from "./shop-settings";

describe("shop settings helpers", () => {
  it("formats the phone for reading and for calling", () => {
    expect(phoneDisplay("254113154708")).toBe("+254 113 154 708");
    expect(phoneHref("254113154708")).toBe("tel:+254113154708");
  });

  it("turns whole hours into opening hours", () => {
    expect(openingHoursOf(defaultShopSettings)).toEqual([
      { days: [1, 2, 3, 4, 5, 6], open: "07:00", close: "20:00" },
      { days: [0], open: "09:00", close: "16:00" },
    ]);
  });

  it("writes hours the way the site shows them", () => {
    expect(hoursRows(defaultShopSettings)).toEqual([
      { days: "Monday – Saturday", time: "7:00 AM – 8:00 PM" },
      { days: "Sunday", time: "9:00 AM – 4:00 PM" },
    ]);
  });
});
