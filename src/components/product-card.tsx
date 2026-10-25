import { Check, Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/cart";
import { ksh } from "@/data/market";
import type { LaundryItem } from "@/data/laundry";

export function ProductCard({ item }: { item: LaundryItem }) {
  const { items, add, setQty } = useCart();
  const inCart = items.find((i) => i.id === item.id);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.tag && (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-white">
            {item.tag}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-semibold leading-tight">{item.name}</h3>
          <p className="font-display text-lg font-semibold text-primary">{ksh(item.price)}</p>
        </div>
        <p className="text-sm leading-snug text-muted-foreground">{item.desc}</p>
        <div className="mt-auto pt-3">
          {inCart ? (
            <div className="flex items-center justify-between rounded-full border border-border bg-secondary px-1.5 py-1">
              <button
                type="button"
                aria-label={`Remove one ${item.name}`}
                onClick={() => setQty(item.id, inCart.qty - 1)}
                className="flex size-7 items-center justify-center rounded-full text-foreground transition-colors hover:bg-background"
              >
                <Minus className="size-4" />
              </button>
              <span className="text-sm font-semibold">{inCart.qty}</span>
              <button
                type="button"
                aria-label={`Add one ${item.name}`}
                onClick={() => setQty(item.id, inCart.qty + 1)}
                className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => add({ id: item.id, name: item.name, price: item.price })}
              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-foreground/15 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Check className="size-4" aria-hidden /> Add to pickup
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
