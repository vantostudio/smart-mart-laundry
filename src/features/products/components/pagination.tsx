import Link from "next/link";

import { Button } from "@/components/ui/button";
import { productMessages } from "@/features/admin/messages";

import { productsHref, type ProductsView } from "../lib/links";

type Props = { view: ProductsView; page: number; limit: number; total: number };

/** Previous, where we are, Next. An end with nowhere to go has no link. */
export function Pagination({ view, page, limit, total }: Props) {
  const pages = Math.max(1, Math.ceil(total / limit));
  return (
    <nav
      aria-label={productMessages.pages}
      className="mt-8 flex flex-wrap items-center justify-between gap-3"
    >
      <p className="text-body-sm text-muted-foreground">
        {productMessages.pageOf(page, pages, total)}
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Button asChild variant="secondary">
            <Link href={productsHref({ ...view, page: page - 1 })}>{productMessages.previous}</Link>
          </Button>
        )}
        {page < pages && (
          <Button asChild variant="secondary">
            <Link href={productsHref({ ...view, page: page + 1 })}>{productMessages.next}</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}
