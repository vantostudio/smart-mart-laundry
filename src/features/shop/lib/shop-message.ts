import type { CartItem } from "@/features/cart/cart-provider";
import { products, type Product } from "@/features/shop/data";
import { ksh } from "@/lib/format";

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
  /** Delivery area; not needed for pick up. */
  area: string | null;
  note?: string;
};

export type ShopGap = "items" | "area";

/** The send button's label while something is missing. */
export const shopGapLabels: Record<ShopGap, string> = {
  items: "Add something to your bag",
  area: "Choose your area",
};

/** What's still missing, in the order the bag asks for it. */
export function shopGaps(itemCount: number, d: ShopDetails): ShopGap[] {
  return [
    ...(itemCount === 0 ? (["items"] as const) : []),
    ...(d.method === "delivery" && !d.area ? (["area"] as const) : []),
  ];
}

/**
 * The WhatsApp message sent from the bag. It arrives from the customer's own number, so their
 * name and phone aren't asked for. Payment is on delivery or at the counter.
 */
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
    ...(d.method === "delivery" ? [`Area: ${d.area ?? "(area)"}`] : []),
    ...(d.note?.trim() ? [`Note: ${d.note.trim()}`] : []),
    "",
    "Please confirm these are still available.",
    d.method === "delivery"
      ? "Payment on delivery (cash or M-Pesa)."
      : "I'll pay at the shop (cash or M-Pesa).",
  ].join("\n");
}
