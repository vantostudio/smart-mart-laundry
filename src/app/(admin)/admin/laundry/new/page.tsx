import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";
import { FreshOnVisit } from "@/features/admin/components/fresh-on-visit";
import { requireAdmin } from "@/features/admin/lib/auth";
import { laundryMessages as m } from "@/features/admin/messages";
import { ItemForm } from "@/features/laundry/components/item-form";
import { parseCategory } from "@/features/laundry/lib/tabs";

export const metadata: Metadata = { title: m.addHeading };

async function NewItem({ searchParams }: Pick<PageProps<"/admin/laundry/new">, "searchParams">) {
  const admin = await requireAdmin({ role: "owner" });
  const { category } = await searchParams;
  return (
    <AdminShell admin={admin}>
      <Button asChild variant="ghost" className="-ml-4">
        <Link href="/admin/laundry">{m.back}</Link>
      </Button>
      <h1 className="mt-2 display text-display">{m.addHeading}</h1>
      <FreshOnVisit>
        <ItemForm category={parseCategory(category as string | undefined) ?? undefined} />
      </FreshOnVisit>
    </AdminShell>
  );
}

export default function Page({ searchParams }: PageProps<"/admin/laundry/new">) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <NewItem searchParams={searchParams} />
    </Suspense>
  );
}
