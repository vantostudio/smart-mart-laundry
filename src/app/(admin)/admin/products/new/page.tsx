import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";
import { productMessages } from "@/features/admin/messages";
import { requireAdmin } from "@/features/admin/lib/auth";
import { ProductForm } from "@/features/products/components/product-form";

export const metadata: Metadata = { title: productMessages.addHeading };

async function NewProduct() {
  const admin = await requireAdmin();
  return (
    <AdminShell admin={admin}>
      <Button asChild variant="ghost" className="-ml-4">
        <Link href="/admin/products">{productMessages.back}</Link>
      </Button>
      <h1 className="mt-2 display text-display">{productMessages.addHeading}</h1>
      <ProductForm />
    </AdminShell>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <NewProduct />
    </Suspense>
  );
}
