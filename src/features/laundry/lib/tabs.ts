import { laundryCategories, type LaundryCategory } from "@/features/laundry/data";

/** `?cat=carpets` → "carpets"; anything else means all categories (null). */
export function parseCategory(value: string | null | undefined): LaundryCategory | null {
  return laundryCategories.find((c) => c.id === value)?.id ?? null;
}
