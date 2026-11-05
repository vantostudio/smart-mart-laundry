import type { ShopSettings } from "@/config/shop-settings";
import { call, json, type Result } from "@/features/admin/lib/api-call";
import type { StaffMember } from "@/features/admin/lib/staff";
import type { AddStaffInput } from "@/features/admin/schema";
import type { AdminRole } from "@/lib/db/schema";

import type { UpdateShopSettingsInput } from "../schema";

/* What the settings page calls in the browser. Phone goes as typed: the API tidies it. */

export function saveOwnName(name: string): Promise<Result<{ name: string }>> {
  return call("/api/admin/me", json("PATCH", { name }));
}

export function saveShopSettings(patch: UpdateShopSettingsInput): Promise<Result<ShopSettings>> {
  return call("/api/admin/settings", json("PATCH", patch));
}

export function addStaffMember(input: AddStaffInput): Promise<Result<StaffMember>> {
  return call("/api/admin/staff", json("POST", input));
}

export function changeStaffRole(id: string, role: AdminRole): Promise<Result<StaffMember>> {
  return call(`/api/admin/staff/${id}`, json("PATCH", { role }));
}

export function removeStaffMember(id: string): Promise<Result<void>> {
  return call(`/api/admin/staff/${id}`, { method: "DELETE" });
}
