import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCachedPublicProduct } from "@/features/products/lib/cached-products";
import { productCode } from "@/features/products/schema";
import { JsonLd } from "@/features/seo/json-ld";
import { productJsonLd } from "@/features/seo/structured-data";
import { ProductPage } from "@/features/shop/components/product-page";
import { shopMessages } from "@/features/shop/messages";
import { pageMetadata } from "@/lib/metadata";

/*
 * One product, server-rendered from the database so search engines see its name, price and photos.
 * A sold-out, deleted or malformed code is a real 404. A database failure throws to `error.tsx`
 * (a 500), and is never cached as "not found" (see `getCachedPublicProduct`). `params` is awaited
 * at the top, not inside <Suspense>, so the status is known before the response starts.
 */

// A code that wasn't prerendered waits for its page instead of getting the generic shell first
// (which would answer 200 even for a sold-out product). The build checks everything here is cached.
export const ensureStatic = "navigation";

// Cache Components needs one sample to validate the route. This isn't a valid code, so it renders
// the 404 at build without touching the database; every real code is rendered on first visit and
// then cached.
export function generateStaticParams() {
  return [{ code: "placeholder" }];
}

async function productFor({ params }: PageProps<"/shop/[code]">) {
  const code = productCode.safeParse((await params).code);
  return code.success ? getCachedPublicProduct(code.data) : null;
}

export async function generateMetadata(props: PageProps<"/shop/[code]">): Promise<Metadata> {
  const p = await productFor(props);
  if (!p) return { title: shopMessages.productPage.missingTitle };
  return pageMetadata({
    title: p.name,
    description: shopMessages.productPage.description(p),
    image: p.photos[0],
    path: `/shop/${p.code}`,
  });
}

export default async function Page(props: PageProps<"/shop/[code]">) {
  const p = await productFor(props);
  if (!p) notFound();
  return (
    <>
      <ProductPage product={p} />
      <JsonLd data={productJsonLd(p)} />
    </>
  );
}
