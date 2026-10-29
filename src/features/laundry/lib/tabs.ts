import { laundryCategories, type LaundryCategory } from "@/features/laundry/data";

export const DEFAULT_TAB: LaundryCategory = "baskets";

/** `?tab=duvets` → "duvets"; anything else falls back to baskets. */
export function parseTab(value: string | null | undefined): LaundryCategory {
  return laundryCategories.find((c) => c.id === value)?.id ?? DEFAULT_TAB;
}
