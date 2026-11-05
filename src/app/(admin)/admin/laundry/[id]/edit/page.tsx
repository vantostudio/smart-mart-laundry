import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";
import { FreshOnVisit } from "@/features/admin/components/fresh-on-visit";
import { requireAdmin } from "@/features/admin/lib/auth";
import { laundryMessages as m } from "@/features/admin/messages";
import { DeleteItem } from "@/features/laundry/components/delete-item";
import { ItemForm } from "@/features/laundry/components/item-form";
import { laundryPhoto } from "@/features/laundry/data";
import { getLaundryItem, isUploadedPhoto } from "@/features/laundry/lib/items";
import { laundryItemId } from "@/features/laundry/schema";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { productImageUrl } from "@/lib/storage";

export const metadata: Metadata = { title: m.editHeading };

async function findItem(id: string) {
  if (!laundryItemId.safeParse(id).success) notFound();
  try {
    return await getLaundryItem(getDb(), id);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
}

async function EditItem({ params }: Pick<PageProps<"/admin/laundry/[id]/edit">, "params">) {
  const admin = await requireAdmin({ role: "owner" });
  const item = await findItem((await params).id);
  const url = isUploadedPhoto(item.image)
    ? productImageUrl(item.image)
    : laundryPhoto(item.image, 400);
  return (
    <AdminShell admin={admin}>
      <Button asChild variant="ghost" className="-ml-4">
        <Link href="/admin/laundry">{m.back}</Link>
      </Button>
      <h1 className="mt-2 display text-display">{m.editHeading}</h1>
      <FreshOnVisit>
        <ItemForm
          item={{
            id: item.id,
            name: item.name,
            desc: item.description,
            price: item.price,
            mark: item.mark,
            photo: { key: item.image, url },
          }}
        />
      </FreshOnVisit>
      <DeleteItem id={item.id} name={item.name} />
    </AdminShell>
  );
}

export default function Page({ params }: PageProps<"/admin/laundry/[id]/edit">) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <EditItem params={params} />
    </Suspense>
  );
}
