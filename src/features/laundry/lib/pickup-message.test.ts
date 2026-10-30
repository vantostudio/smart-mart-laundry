import { describe, expect, it } from "vite-plus/test";

import { bookingGaps, buildPickupMessage } from "./pickup-message";

const items = [
  { id: "basket-small", name: "Small basket", price: 150, qty: 2 },
  { id: "carpet-medium", name: "Medium carpet", price: 700, qty: 1 },
];
const details = { pickup: "2026-10-29", back: "2026-10-30", area: "Ndagani" };

describe("buildPickupMessage", () => {
  it("lists the items, total, dates and area, with no name or phone", () => {
    const message = buildPickupMessage(items, details);
    expect(message).toContain("• 2 × Small basket — KSh 300");
    expect(message).toContain("• 1 × Medium carpet — KSh 700");
    expect(message).toContain("Total: KSh 1,000");
    expect(message).toContain("Collection: Thu 29 Oct");
    expect(message).toContain("Return: Fri 30 Oct");
    expect(message).toContain("Area: Ndagani");
    expect(message).toContain("Payment on delivery");
    expect(message).not.toMatch(/Name:|Phone:/);
  });

  it("asks for a morning collection when it comes back the same day", () => {
    const message = buildPickupMessage(items, { ...details, back: details.pickup });
    expect(message).toContain("Return: Thu 29 Oct (same day, so a morning collection please)");
  });

  it("adds the note only when there is one", () => {
    expect(buildPickupMessage(items, { ...details, note: "  Hostel B, room 12 " })).toContain(
      "Note: Hostel B, room 12",
    );
    expect(buildPickupMessage(items, { ...details, note: "  " })).not.toContain("Note:");
  });

  it("uses placeholders for anything missing", () => {
    const message = buildPickupMessage([], { pickup: null, back: null, area: null });
    expect(message).toContain("(nothing added yet)");
    expect(message).toContain("Collection: (day)");
    expect(message).toContain("Area: (area)");
  });
});

describe("bookingGaps", () => {
  it("lists what's missing in the order the sheet asks for it", () => {
    expect(bookingGaps(0, { pickup: null, back: null, area: null })).toEqual([
      "items",
      "pickup",
      "back",
      "area",
    ]);
    expect(bookingGaps(2, details)).toEqual([]);
  });
});
