import { describe, expect, it } from "vite-plus/test";

import { buildPickupMessage, pickupLine, returnLine } from "./pickup-message";

const booking = { pickup: "2026-10-29", window: "morning", return: "next-day" } as const;
const details = { booking, location: "Chuka town", name: "Jane Wanjiru", phone: "0712 345 678" };

describe("buildPickupMessage", () => {
  it("lists every line item with its subtotal and the estimated total", () => {
    const message = buildPickupMessage(
      [
        { id: "a", name: "Small basket", price: 150, qty: 2 },
        { id: "b", name: "Door mat", price: 50, qty: 1 },
      ],
      details,
    );

    expect(message).toContain("• 2 × Small basket — KSh 300");
    expect(message).toContain("• 1 × Door mat — KSh 50");
    expect(message).toContain("Estimated total: KSh 350");
    expect(message).toContain("Payment on delivery");
  });

  it("includes the pickup slot, return, location and contact details", () => {
    const message = buildPickupMessage([], details);
    expect(message).toContain("Pickup: Thu 29 Oct, morning (7–10 AM)");
    expect(message).toContain("Return: Next day, back Fri 30 Oct by 7 PM");
    expect(message).toContain("Location: Chuka town");
    expect(message).toContain("Name: Jane Wanjiru");
    expect(message).toContain("Phone: 0712 345 678");
  });

  it("says how to tell the customer it's ready, WhatsApp by default", () => {
    expect(buildPickupMessage([], details)).toContain("Notify me by: WhatsApp");
    expect(buildPickupMessage([], { ...details, notify: "sms" })).toContain("Notify me by: SMS");
    const call = buildPickupMessage([], { ...details, notify: "call" });
    expect(call).toContain("Notify me by: Phone call");
    // Comes straight after the contact details, before the payment note.
    expect(call.indexOf("Notify me by")).toBeGreaterThan(call.indexOf("Phone: 0712"));
    expect(call.indexOf("Notify me by")).toBeLessThan(call.indexOf("Payment on delivery"));
  });

  it("adds the customer's notes only when there are some", () => {
    expect(buildPickupMessage([], { ...details, notes: "  Gate is green  " })).toContain(
      "Notes: Gate is green",
    );
    expect(buildPickupMessage([], { ...details, notes: "   " })).not.toContain("Notes:");
    expect(buildPickupMessage([], details)).not.toContain("Notes:");
  });

  it("uses placeholders for anything missing", () => {
    const message = buildPickupMessage([], { booking: null, location: " ", name: "", phone: "" });
    expect(message).toContain("• (nothing added yet)");
    expect(message).toContain("Pickup: (day and time)");
    expect(message).toContain("Return: (return day)");
    expect(message).toContain("Location: (location)");
    expect(message).toContain("Name: (name)");
    expect(message).toContain("Phone: (phone)");
  });
});

describe("pickupLine / returnLine", () => {
  it("describes same-day and Sunday returns", () => {
    expect(pickupLine({ ...booking, window: "midday" })).toBe("Thu 29 Oct, midday (10 AM–1 PM)");
    expect(returnLine({ ...booking, return: "same-day" })).toBe(
      "Same day, back Thu 29 Oct by 7 PM",
    );
    expect(returnLine({ pickup: "2026-10-30", window: "evening", return: "two-days" })).toBe(
      "2 days, back Sun 1 Nov by 4 PM",
    );
  });
});
