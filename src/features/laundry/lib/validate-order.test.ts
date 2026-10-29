import { describe, expect, it } from "vite-plus/test";

import { isKenyanPhone, validateOrder } from "./validate-order";

const valid = {
  booking: { pickup: "2026-10-29", window: "morning", return: "next-day" },
  itemCount: 2,
  location: "Chuka town",
  name: "Jane",
  phone: "0712 345 678",
} as const;

describe("isKenyanPhone", () => {
  it.each(["0712345678", "0712 345 678", "+254 712 345 678", "254112345678", "0113-154-708"])(
    "accepts %s",
    (n) => expect(isKenyanPhone(n)).toBe(true),
  );

  it.each(["071234567", "0812345678", "12345", "+1 555 123 4567", "07123456789"])(
    "rejects %s",
    (n) => expect(isKenyanPhone(n)).toBe(false),
  );
});

describe("validateOrder", () => {
  it("passes a complete order", () => {
    expect(validateOrder(valid)).toEqual({});
  });

  it("reports missing pieces in page order", () => {
    const errors = validateOrder({
      booking: null,
      itemCount: 0,
      location: "",
      name: " ",
      phone: "",
    });
    expect(Object.keys(errors)).toEqual(["when", "items", "location", "name", "phone"]);
  });

  it("explains a malformed phone number", () => {
    expect(validateOrder({ ...valid, phone: "12345" }).phone).toMatch(/0712 345 678/);
  });
});
