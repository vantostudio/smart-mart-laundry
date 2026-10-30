import { formatDay, isSameDay, type BookingDates } from "@/features/booking/schedule";
import type { CartItem } from "@/features/cart/cart-provider";
import { ksh } from "@/lib/format";

type PickupDetails = BookingDates & {
  area: string | null;
  /** Optional: hostel, gate or anything else for the rider. */
  note?: string;
};

export type BookingGap = "items" | "pickup" | "back" | "area";

/** What's still missing, in the order the booking sheet asks for it. */
export function bookingGaps(itemCount: number, d: PickupDetails): BookingGap[] {
  return [
    ...(itemCount === 0 ? (["items"] as const) : []),
    ...(d.pickup ? [] : (["pickup"] as const)),
    ...(d.back ? [] : (["back"] as const)),
    ...(d.area ? [] : (["area"] as const)),
  ];
}

/** The send button's label while something is missing, so it says what to do next. */
export const gapLabels: Record<BookingGap, string> = {
  items: "Add something to wash",
  pickup: "Pick a collection day",
  back: "Pick a return day",
  area: "Choose your area",
};

/**
 * The WhatsApp message sent from the booking sheet. It arrives from the customer's own number,
 * so their name and phone aren't asked for. Payment is always on delivery.
 */
export function buildPickupMessage(items: CartItem[], d: PickupDetails): string {
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const day = (iso: string | null, placeholder: string) =>
    iso ? formatDay(iso, { month: true }) : placeholder;
  return [
    "Hi Street Mart! I'd like to book a laundry pickup.",
    "",
    ...(items.length > 0
      ? items.map((i) => `• ${i.qty} × ${i.name} — ${ksh(i.price * i.qty)}`)
      : ["• (nothing added yet)"]),
    `Total: ${ksh(total)}`,
    "",
    `Collection: ${day(d.pickup, "(day)")}`,
    `Return: ${day(d.back, "(day)")}${isSameDay(d) ? " (same day, so a morning collection please)" : ""}`,
    `Area: ${d.area ?? "(area)"}`,
    ...(d.note?.trim() ? [`Note: ${d.note.trim()}`] : []),
    "",
    "Payment on delivery (cash or M-Pesa).",
  ].join("\n");
}
