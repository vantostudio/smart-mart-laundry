import {
  formatDay,
  formatHour,
  returnFor,
  windowById,
  type CompleteBooking,
} from "@/features/booking/schedule";
import type { CartItem } from "@/features/cart/cart-provider";
import { DEFAULT_NOTIFY, notifyOption, type NotifyMethod } from "@/features/laundry/data";
import { ksh } from "@/lib/format";

type PickupDetails = {
  /** Null until the visitor has picked a day, window and return. */
  booking: CompleteBooking | null;
  location: string;
  name: string;
  phone: string;
  /** How to tell the customer it's ready. Defaults to WhatsApp. */
  notify?: NotifyMethod;
  /** Optional instructions: stains, delicate items, how to find the gate. */
  notes?: string;
};

const orPlaceholder = (value: string, placeholder: string) => value.trim() || placeholder;

/** "Thu 29 Oct, morning (7–10 AM)". */
export function pickupLine(booking: CompleteBooking): string {
  const w = windowById(booking.window);
  return `${formatDay(booking.pickup, { month: true })}, ${w.label.toLowerCase()} (${w.time})`;
}

/** "Next day, back Fri 30 Oct by 7 PM". */
export function returnLine(booking: CompleteBooking): string {
  const r = returnFor(booking);
  return `${r.label}, back ${formatDay(r.iso, { month: true })} by ${formatHour(r.byHour)}`;
}

/** The WhatsApp message sent at checkout. Payment is always on delivery. */
export function buildPickupMessage(items: CartItem[], details: PickupDetails): string {
  const total = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const { booking } = details;
  return [
    "Hi Street Mart! I'd like to book a laundry pickup.",
    "",
    "Order:",
    ...(items.length > 0
      ? items.map((i) => `• ${i.qty} × ${i.name} — ${ksh(i.price * i.qty)}`)
      : ["• (nothing added yet)"]),
    `Estimated total: ${ksh(total)}`,
    "",
    `Pickup: ${booking ? pickupLine(booking) : "(day and time)"}`,
    `Return: ${booking ? returnLine(booking) : "(return day)"}`,
    `Location: ${orPlaceholder(details.location, "(location)")}`,
    `Name: ${orPlaceholder(details.name, "(name)")}`,
    `Phone: ${orPlaceholder(details.phone, "(phone)")}`,
    `Notify me by: ${notifyOption(details.notify ?? DEFAULT_NOTIFY).label}`,
    ...(details.notes?.trim() ? [`Notes: ${details.notes.trim()}`] : []),
    "",
    "Payment on delivery (cash or M-Pesa).",
  ].join("\n");
}
