import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { productMessages } from "@/features/admin/messages";

import { productsHref, type ProductsView } from "../lib/links";
import type { ProductPage } from "../lib/products";
import { Pagination } from "./pagination";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";

type Props = {
  result: ProductPage;
  view: ProductsView;
  /** The address of a photo key, from the server. */
  photoUrl: (key: string) => string;
};

function Empty({ result, view }: Pick<Props, "result" | "view">) {
  const filtered = view.category !== undefined || view.condition !== undefined;
  const pastTheEnd = result.total > 0;
  const action = pastTheEnd
    ? { href: productsHref({ ...view, page: 1 }), label: productMessages.firstPage }
    : filtered
      ? { href: productsHref({}), label: productMessages.clearFilters }
      : null;
  return (
    <div className="mt-6 rounded-3xl bg-card p-6 text-center shadow-card">
      <p className="text-body text-muted-foreground">
        {pastTheEnd
          ? productMessages.pastTheEnd
          : filtered
            ? productMessages.noMatches
            : productMessages.empty}
      </p>
      {action && (
        <Button asChild variant="secondary" className="mt-4">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

export function ProductList({ result, view, photoUrl }: Props) {
  const { items, page, limit, total } = result;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="display text-display">{productMessages.heading}</h1>
        <Button asChild variant="clay">
          <Link href="/admin/products/new">
            <Plus aria-hidden />
            {productMessages.add}
          </Link>
        </Button>
      </div>
      <p className="mt-4 rounded-2xl bg-secondary px-4 py-3 text-body-sm text-secondary-foreground">
        {productMessages.stockReminder}
      </p>
      <ProductFilters {...view} />
      {items.length === 0 ? (
        <Empty result={result} view={view} />
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                photoUrl={product.images[0] ? photoUrl(product.images[0]) : null}
              />
            ))}
          </ul>
          <Pagination view={view} page={page} limit={limit} total={total} />
        </>
      )}
    </>
  );
}
