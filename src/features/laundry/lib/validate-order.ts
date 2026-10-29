import type { CompleteBooking } from "@/features/booking/schedule";
import { isKenyanPhone } from "@/lib/phone";

export type OrderField = "when" | "items" | "location" | "name" | "phone";

type OrderInput = {
  booking: CompleteBooking | null;
  itemCount: number;
  location: string;
  name: string;
  phone: string;
};

const orderMessages = {
  when: "Choose a pickup day and time.",
  items: "Add at least one basket or item.",
  location: "Tell us where to collect from.",
  name: "Add your name.",
  phone: "Add a phone number.",
  phoneFormat: "Use a number like 0712 345 678.",
} as const;

/**
 * Problems with the order, in page order (when → items → location → name → phone), so the
 * first key is the field to focus.
 */
export function validateOrder(input: OrderInput): Partial<Record<OrderField, string>> {
  const errors: Partial<Record<OrderField, string>> = {};
  if (!input.booking) errors.when = orderMessages.when;
  if (input.itemCount === 0) errors.items = orderMessages.items;
  if (input.location.trim().length < 3) errors.location = orderMessages.location;
  if (!input.name.trim()) errors.name = orderMessages.name;
  if (!input.phone.trim()) errors.phone = orderMessages.phone;
  else if (!isKenyanPhone(input.phone)) errors.phone = orderMessages.phoneFormat;
  return errors;
}
