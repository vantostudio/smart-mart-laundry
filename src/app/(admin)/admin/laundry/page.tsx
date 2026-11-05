import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";
import { requireAdmin } from "@/features/admin/lib/auth";
import { laundryMessages as m } from "@/features/admin/messages";
import { PriceForm } from "@/features/laundry/components/price-form";
import { itemsIn, laundryCategories } from "@/features/laundry/data";
import { listLaundryItems } from "@/features/laundry/lib/items";
import { getDb } from "@/lib/db";
import { productImageUrl } from "@/lib/storage";

export const metadata: Metadata = { title: m.heading };

async function LaundryPrices() {
  const admin = await requireAdmin();
  const items = await listLaundryItems(getDb(), productImageUrl);
  const canEdit = admin.role === "owner";

  return (
    <AdminShell admin={admin}>
      <h1 className="display text-display-lg">{m.heading}</h1>
      <p className="mt-2 max-w-reading text-body-sm text-muted-foreground">
        {canEdit ? m.body : m.ownerOnly}
      </p>
      <div className="mt-6 grid max-w-3xl gap-5">
        {laundryCategories.map((c) => {
          const group = itemsIn(c.id, items);
          return (
            <PriceForm
              key={c.id}
              category={c.id}
              heading={c.label}
              note={c.note}
              items={group}
              canEdit={canEdit}
            />
          );
        })}
      </div>
    </AdminShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <LaundryPrices />
    </Suspense>
  );
}
