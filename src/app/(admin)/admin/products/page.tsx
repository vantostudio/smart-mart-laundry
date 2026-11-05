import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";
import { productMessages } from "@/features/admin/messages";
import { requireAdmin } from "@/features/admin/lib/auth";
import { ProductList } from "@/features/products/components/product-list";
import { listProducts } from "@/features/products/lib/products";
import { listProductsInput } from "@/features/products/schema";
import { getDb } from "@/lib/db";
import { productImageUrl } from "@/lib/storage";

export const metadata: Metadata = { title: productMessages.heading };

async function Products({ searchParams }: Pick<PageProps<"/admin/products">, "searchParams">) {
  const admin = await requireAdmin();
  const parsed = listProductsInput.safeParse(await searchParams);
  // A hand-typed bad URL shows the first page rather than an error.
  const query = parsed.success ? parsed.data : listProductsInput.parse({});
  const result = await listProducts(getDb(), query);
  const { page, category, condition } = query;
  return (
    <AdminShell admin={admin}>
      <ProductList
        result={result}
        view={{ page, category, condition }}
        photoUrl={productImageUrl}
      />
    </AdminShell>
  );
}

export default function Page({ searchParams }: PageProps<"/admin/products">) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <Products searchParams={searchParams} />
    </Suspense>
  );
}
