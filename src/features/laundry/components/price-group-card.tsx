import { Card } from "@/components/shared/card";
import { Price } from "@/components/shared/price";
import type { PriceGroup } from "@/features/laundry/data";

export function PriceGroupCard({ group }: { group: PriceGroup }) {
  return (
    <Card>
      <h3 className="text-subtitle font-semibold">{group.title}</h3>
      <p className="mt-1 overline text-muted-foreground">{group.note}</p>
      <ul className="mt-4">
        {group.items.map((item) => (
          <li
            key={item.label}
            className="flex items-baseline justify-between gap-3 border-b border-dashed border-border py-2.5 text-body-sm last:border-0"
          >
            <span>{item.label}</span>
            <Price amount={item.price} size="sm" className="text-primary" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
