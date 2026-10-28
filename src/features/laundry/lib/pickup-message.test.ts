import { describe, expect, it } from "vite-plus/test";

import { buildPickupMessage } from "./pickup-message";

const details = {
  location: "",
  pickupDay: "Today",
  pickupTime: "9:00 AM",
  returnDay: "Tomorrow",
  returnTime: "7:00 PM",
};

describe("buildPickupMessage", () => {
  it("lists every line item with its subtotal and the order total", () => {
    const message = buildPickupMessage(
      [
        { id: "a", name: "Small basket", price: 150, qty: 2 },
        { id: "b", name: "Door mat", price: 50, qty: 1 },
      ],
      { ...details, location: "Chuka town" },
    );

    expect(message).toContain("• 2 × Small basket — KSh 300");
    expect(message).toContain("• 1 × Door mat — KSh 50");
    expect(message).toContain("Total: KSh 350");
    expect(message).toContain("Pickup: Chuka town, Today at 9:00 AM");
    expect(message).toContain("Return by: Tomorrow at 7:00 PM");
    expect(message).toContain("Payment on delivery");
  });

  it("uses a placeholder when no location is given", () => {
    expect(buildPickupMessage([], details)).toContain("Pickup: (location), Today at 9:00 AM");
  });
});
