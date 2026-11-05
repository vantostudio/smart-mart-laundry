import type { ProductCategory, ProductCondition } from "@/lib/db/schema";

/* Names people read. Client components import this, so types only from the database schema. */

export const categoryLabels: Record<ProductCategory, string> = {
  ladies: "Ladies wear",
  men: "Men's wear",
  shoes: "Shoes",
};

export const conditionLabels: Record<ProductCondition, string> = {
  new: "New",
  mtumba: "Mtumba",
};

/** Label entries in declared order, typed for `ChoiceChips` and the filters. */
export function optionsOf<T extends string>(labels: Record<T, string>) {
  return (Object.keys(labels) as T[]).map((value) => ({ value, label: labels[value] }));
}
