"use client";

import { Plus } from "lucide-react";

import { Card, CardBody, CardMedia } from "@/components/shared/card";
import { Price } from "@/components/shared/price";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";
import type { LaundryItem } from "@/features/laundry/data";

export function LaundryItemCard({
  item,
  priority = false,
}: {
  item: LaundryItem;
  priority?: boolean;
}) {
  const { items, add, setQty } = useCart();
  const inCart = items.find((i) => i.id === item.id);

  return (
    <Card asChild variant="interactive" padding="none">
      <article>
        <CardMedia
          src={item.image}
          alt={item.name}
          priority={priority}
          sizes="(min-width: 1280px) 190px, (min-width: 768px) 33vw, 50vw"
        >
          {item.tag && (
            <Badge variant="gradient" size="sm" className="absolute top-3 left-3">
              {item.tag}
            </Badge>
          )}
        </CardMedia>
        <CardBody className="gap-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-subtitle leading-tight font-semibold">{item.name}</h3>
            <Price amount={item.price} className="text-primary" />
          </div>
          <p className="text-body-sm text-muted-foreground">{item.desc}</p>
          <div className="mt-auto pt-4">
            {inCart ? (
              <QuantityStepper
                block
                label={item.name}
                value={inCart.qty}
                onChange={(qty) => setQty(item.id, qty)}
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                block
                onClick={() => add({ id: item.id, name: item.name, price: item.price })}
                className="h-10 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              >
                <Plus aria-hidden /> Add to pickup
              </Button>
            )}
          </div>
        </CardBody>
      </article>
    </Card>
  );
}
