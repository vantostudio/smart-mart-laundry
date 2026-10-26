import { ksh } from "@/data/market";
import type { PriceGroup } from "@/data/laundry";

export function PriceGroupCard({ group }: { group: PriceGroup }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <h3 className="font-display text-lg font-semibold">{group.title}</h3>
      <p className="mt-0.5 text-xs uppercase tracking-[0.1em] text-muted-foreground">
        {group.note}
      </p>
      <ul className="mt-3">
        {group.items.map((item, i) => (
          <li
            key={item.label}
            className={`flex items-baseline justify-between gap-3 py-2 text-sm ${
              i < group.items.length - 1 ? "border-b border-dashed border-border" : ""
            }`}
          >
            <span>{item.label}</span>
            <span className="font-semibold text-primary">{ksh(item.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
