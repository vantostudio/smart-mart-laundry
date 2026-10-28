"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-provider";

export function CartLink() {
  const { count } = useCart();
  return (
    <Button asChild variant="ghost" size="icon">
      <Link
        href="/laundry#cart"
        aria-label={count > 0 ? `Laundry cart, ${count} items` : "Laundry cart"}
      >
        <ShoppingBag />
        {count > 0 && (
          <Badge
            variant="gradient"
            size="sm"
            className="absolute -top-0.5 -right-0.5 size-5 justify-center p-0 figures"
          >
            {count}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
