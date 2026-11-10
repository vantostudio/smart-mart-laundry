import { call, json, type Result } from "@/features/admin/lib/api-call";
import type { LaundryItemRow } from "@/lib/db/schema";

import type {
  CreateLaundryItemInput,
  UpdateLaundryItemInput,
  UpdateLaundryPricesInput,
} from "../schema";

/* What the laundry screens call in the browser. */

export function saveLaundryPrices(prices: UpdateLaundryPricesInput): Promise<Result<void>> {
  return call("/api/admin/laundry-prices", json("PATCH", prices));
}

export function createLaundryItem(input: CreateLaundryItemInput): Promise<Result<LaundryItemRow>> {
  return call("/api/admin/laundry-items", json("POST", input));
}

export function updateLaundryItem(
  id: string,
  patch: UpdateLaundryItemInput,
): Promise<Result<LaundryItemRow>> {
  return call(`/api/admin/laundry-items/${id}`, json("PATCH", patch));
}

export function deleteLaundryItem(id: string): Promise<Result<void>> {
  return call(`/api/admin/laundry-items/${id}`, { method: "DELETE" });
}
