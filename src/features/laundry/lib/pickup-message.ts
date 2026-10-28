import type { CartItem } from "@/features/cart/cart-provider";
import { ksh } from "@/lib/format";

export type PickupDetails = {
  location: string;
  pickupDay: string;
  pickupTime: string;
  returnDay: string;
  returnTime: string;
};

/** The WhatsApp message sent at checkout. Payment is always on delivery. */
export function buildPickupMessage(items: CartItem[], details: PickupDetails): string {
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  return [
    "Hi Street Mart! I'd like to book a laundry pickup.",
    "",
    "Order:",
    ...items.map((i) => `• ${i.qty} × ${i.name} — ${ksh(i.price * i.qty)}`),
    `Total: ${ksh(total)}`,
    "",
    `Pickup: ${details.location || "(location)"}, ${details.pickupDay} at ${details.pickupTime}`,
    `Return by: ${details.returnDay} at ${details.returnTime}`,
    "",
    "Payment on delivery (cash or M-Pesa).",
  ].join("\n");
}
