import type { ShopSettings } from "@/config/shop-settings";

export type FulfilMethod = "delivery" | "pickup";

export type DeliveryRates = Pick<ShopSettings, "deliveryFee" | "deliveryFreeFrom">;

export const fulfilOptions = [
  { id: "delivery", label: "Deliver to me", sublabel: "Anywhere in Chuka" },
  { id: "pickup", label: "Pick up in store", sublabel: "Try it on first" },
] as const satisfies readonly { id: FulfilMethod; label: string; sublabel: string }[];

/**
 * What delivery costs for a bag: free from `deliveryFreeFrom`, otherwise the flat fee.
 * `remaining` is how much more would make it free (0 once it is, or for pick up).
 */
export function deliveryFor(subtotal: number, method: FulfilMethod, rates: DeliveryRates) {
  if (method === "pickup") return { fee: 0, free: true, remaining: 0 };
  const remaining = Math.max(0, rates.deliveryFreeFrom - subtotal);
  const free = subtotal > 0 && remaining === 0;
  return { fee: free || subtotal === 0 ? 0 : rates.deliveryFee, free, remaining };
}
