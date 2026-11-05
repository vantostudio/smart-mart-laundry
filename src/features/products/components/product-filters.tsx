import Link from "next/link";

import { Button } from "@/components/ui/button";
import { productMessages } from "@/features/admin/messages";

import { categoryLabels, conditionLabels, optionsOf } from "../labels";
import { productsHref, type ProductsView } from "../lib/links";

type Pill = { label: string; view: ProductsView; current: boolean };

function PillRow({ label, pills }: { label: string; pills: Pill[] }) {
  return (
    <nav
      aria-label={label}
      className="flex [scrollbar-width:none] gap-2 overflow-x-auto md:flex-wrap md:overflow-visible [&::-webkit-scrollbar]:hidden"
    >
      {pills.map((pill) => (
        <Button
          key={pill.label}
          asChild
          variant={pill.current ? "primary" : "secondary"}
          className="shrink-0"
        >
          <Link href={productsHref(pill.view)} aria-current={pill.current ? "true" : undefined}>
            {pill.label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}

/** Plain links, so filters work from the URL and Back undoes them. Changing one resets the page. */
export function ProductFilters({ category, condition }: ProductsView) {
  return (
    <div className="mt-6 space-y-2">
      <PillRow
        label={productMessages.filterCondition}
        pills={[
          {
            label: productMessages.allConditions,
            view: { category },
            current: condition === undefined,
          },
          ...optionsOf(conditionLabels).map(({ value, label }) => ({
            label,
            view: { category, condition: value },
            current: condition === value,
          })),
        ]}
      />
      <PillRow
        label={productMessages.filterCategory}
        pills={[
          {
            label: productMessages.allCategories,
            view: { condition },
            current: category === undefined,
          },
          ...optionsOf(categoryLabels).map(({ value, label }) => ({
            label,
            view: { category: value, condition },
            current: category === value,
          })),
        ]}
      />
    </div>
  );
}
