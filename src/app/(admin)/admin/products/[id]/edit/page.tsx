import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { AdminShell, AdminShellSkeleton } from "@/features/admin/components/admin-shell";
import { FreshOnVisit } from "@/features/admin/components/fresh-on-visit";
import { productMessages } from "@/features/admin/messages";
import { requireAdmin } from "@/features/admin/lib/auth";
import { DeleteProduct } from "@/features/products/components/delete-product";
import { ProductForm } from "@/features/products/components/product-form";
import { getProduct } from "@/features/products/lib/products";
import { productId } from "@/features/products/schema";
import { getDb } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { productImageUrl } from "@/lib/storage";

export const metadata: Metadata = { title: productMessages.editHeading };

async function findProduct(id: string) {
  if (!productId.safeParse(id).success) notFound();
  try {
    return await getProduct(getDb(), id);
  } catch (err) {
    if (err instanceof AppError && err.code === "NOT_FOUND") notFound();
    throw err;
  }
}

async function EditProduct({ params }: Pick<PageProps<"/admin/products/[id]/edit">, "params">) {
  const admin = await requireAdmin();
  const product = await findProduct((await params).id);
  const photos = product.images.map((key) => ({ key, url: productImageUrl(key) }));
  return (
    <AdminShell admin={admin}>
      <Button asChild variant="ghost" className="-ml-4">
        <Link href="/admin/products">{productMessages.back}</Link>
      </Button>
      <h1 className="mt-2 display text-display">{productMessages.editHeading}</h1>
      <p className="text-body-sm text-muted-foreground">{product.code}</p>
      <FreshOnVisit>
        <ProductForm product={product} photos={photos} />
      </FreshOnVisit>
      <DeleteProduct id={product.id} name={product.name} />
    </AdminShell>
  );
}

export default function Page({ params }: PageProps<"/admin/products/[id]/edit">) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <EditProduct params={params} />
    </Suspense>
  );
}
