import type { CartItem } from "@/features/cart/cart-provider";
import { products, type Product } from "@/features/shop/data";
import { ksh } from "@/lib/format";
import { isKenyanPhone } from "@/lib/phone";

import { deliveryFor, fulfilOptions, type FulfilMethod } from "./delivery";

/** A bag line is one product in one size. */
export const bagLineId = (p: Product, size: string) => `${p.code}:${size}`;

export function bagLine(p: Product, size: string): Omit<CartItem, "qty"> {
  return {
    id: bagLineId(p, size),
    name: p.name,
    price: p.price,
    detail: `${p.code} · Size ${size}`,
    max: p.stock,
  };
}

/** The product behind a bag line, for its photo (lines from an old catalogue return undefined). */
export const productForLine = (id: string) => products.find((p) => id.startsWith(`${p.code}:`));

type ShopDetails = {
  method: FulfilMethod;
  location: string;
  name: string;
  phone: string;
  notes?: string;
};

export type ShopField = "items" | "location" | "name" | "phone";

const shopMessages = {
  items: "Add something to your bag.",
  location: "Tell us where to deliver.",
  name: "Add your name.",
  phone: "Add a phone number.",
  phoneFormat: "Use a number like 0712 345 678.",
} as const;

/** Problems with the bag, in form order, so the first key is the field to focus. */
export function validateShopOrder(
  itemCount: number,
  d: ShopDetails,
): Partial<Record<ShopField, string>> {
  const errors: Partial<Record<ShopField, string>> = {};
  if (itemCount === 0) errors.items = shopMessages.items;
  if (d.method === "delivery" && d.location.trim().length < 3) {
    errors.location = shopMessages.location;
  }
  if (!d.name.trim()) errors.name = shopMessages.name;
  if (!d.phone.trim()) errors.phone = shopMessages.phone;
  else if (!isKenyanPhone(d.phone)) errors.phone = shopMessages.phoneFormat;
  return errors;
}

const orPlaceholder = (value: string, placeholder: string) => value.trim() || placeholder;

/** The WhatsApp message sent from the bag. Payment is on delivery or at the counter. */
export function buildShopMessage(items: CartItem[], d: ShopDetails): string {
  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const delivery = deliveryFor(subtotal, d.method);
  const method = fulfilOptions.find((o) => o.id === d.method)!;
  return [
    "Hi Street Mart! I'd like to order from the shop.",
    "",
    "Items:",
    ...(items.length > 0
      ? items.map(
          (i) =>
            `• ${i.qty} × ${i.name}${i.detail ? ` (${i.detail})` : ""} — ${ksh(i.price * i.qty)}`,
        )
      : ["• (nothing added yet)"]),
    `Subtotal: ${ksh(subtotal)}`,
    ...(d.method === "delivery"
      ? [`Delivery: ${delivery.fee === 0 ? "Free" : ksh(delivery.fee)}`]
      : []),
    `Total: ${ksh(subtotal + delivery.fee)}`,
    "",
    `${method.label}`,
    ...(d.method === "delivery" ? [`Location: ${orPlaceholder(d.location, "(location)")}`] : []),
    `Name: ${orPlaceholder(d.name, "(name)")}`,
    `Phone: ${orPlaceholder(d.phone, "(phone)")}`,
    ...(d.notes?.trim() ? [`Notes: ${d.notes.trim()}`] : []),
    "",
    "Please confirm these are still available.",
    d.method === "delivery"
      ? "Payment on delivery (cash or M-Pesa)."
      : "I'll pay at the shop (cash or M-Pesa).",
  ].join("\n");
}
