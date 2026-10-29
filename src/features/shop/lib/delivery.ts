import { SHOP_DELIVERY } from "@/features/shop/data";

export type FulfilMethod = "delivery" | "pickup";

export const fulfilOptions = [
  { id: "delivery", label: "Deliver to me", sublabel: "Anywhere in Chuka" },
  { id: "pickup", label: "Pick up in store", sublabel: "Try it on first" },
] as const satisfies readonly { id: FulfilMethod; label: string; sublabel: string }[];

/**
 * What delivery costs for a bag: free from `SHOP_DELIVERY.freeFrom`, otherwise the flat fee.
 * `remaining` is how much more would make it free (0 once it is, or for pick up).
 */
export function deliveryFor(subtotal: number, method: FulfilMethod) {
  if (method === "pickup") return { fee: 0, free: true, remaining: 0 };
  const remaining = Math.max(0, SHOP_DELIVERY.freeFrom - subtotal);
  const free = subtotal > 0 && remaining === 0;
  return { fee: free || subtotal === 0 ? 0 : SHOP_DELIVERY.fee, free, remaining };
}
