import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/features/admin/lib/auth";
import { listStaff } from "@/features/admin/lib/staff";
import { settingsMessages } from "@/features/admin/messages";
import { ContactForm } from "@/features/settings/components/contact-form";
import { DeliveryForm } from "@/features/settings/components/delivery-form";
import { NameForm } from "@/features/settings/components/name-form";
import { StaffSection } from "@/features/settings/components/staff-section";
import { getShopSettings } from "@/features/settings/lib/settings";
import { getDb } from "@/lib/db";

export const metadata: Metadata = { title: settingsMessages.heading };

async function Settings() {
  const admin = await requireAdmin();
  const owner = admin.role === "owner";
  const [shop, staff] = owner
    ? await Promise.all([getShopSettings(getDb()), listStaff(getDb())])
    : [null, null];

  return (
    <AdminShell admin={admin}>
      <h1 className="display text-display-lg">{settingsMessages.heading}</h1>
      <div className="mt-6 grid max-w-3xl gap-5">
        <NameForm name={admin.name} />
        {shop && staff && (
          <>
            <DeliveryForm settings={shop} />
            <ContactForm settings={shop} />
            <StaffSection staff={staff} adminId={admin.adminId} />
          </>
        )}
      </div>
    </AdminShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <Settings />
    </Suspense>
  );
}
