"use client";

import { ShoppingBag } from "lucide-react";

import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categoryLabels } from "@/features/products/labels";
import type { PublicProduct } from "@/features/products/public";
import { shopMessages, type LoadProblem } from "@/features/shop/messages";
import { cn } from "@/lib/utils";

import {
  AddToBag,
  ProductHelp,
  ProductOptions,
  ProductSummary,
  useProductChoice,
} from "./product-details";
import { ProductPhoto } from "./product-photo";

type Props = {
  open: boolean;
  /** Null while it loads, or when it couldn't be loaded. */
  product: PublicProduct | null;
  problem: LoadProblem | null;
  onRetry: () => void;
  onOpenChange: (open: boolean) => void;
  onViewBag: () => void;
};

/**
 * Quick view: photos, condition, size when there's one to choose, quantity, and Add to bag. An old
 * or shared link can point at something sold or missing, so the sheet says so.
 */
export function ProductSheet({ open, product, problem, onRetry, onOpenChange, onViewBag }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        {/* Keyed, so picking another item starts with a clean size and quantity. */}
        {product ? (
          <ProductDetails
            key={product.code}
            product={product}
            onClose={() => onOpenChange(false)}
            onViewBag={onViewBag}
          />
        ) : problem ? (
          <ProductProblem problem={problem} onRetry={onRetry} onClose={() => onOpenChange(false)} />
        ) : (
          <ProductLoading />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ProductLoading() {
  return (
    <>
      <SheetHeader>
        <SheetTitle>{shopMessages.loadingItem}</SheetTitle>
        <SheetDescription className="sr-only">{shopMessages.loadingItem}</SheetDescription>
      </SheetHeader>
      <SheetBody className="pb-5">
        <div aria-hidden className="aspect-4/5 w-full animate-pulse rounded-3xl bg-muted" />
      </SheetBody>
    </>
  );
}

function ProductProblem({
  problem,
  onRetry,
  onClose,
}: {
  problem: LoadProblem;
  onRetry: () => void;
  onClose: () => void;
}) {
  const { title, body } = shopMessages.item[problem];
  return (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{body}</SheetDescription>
      </SheetHeader>
      <SheetFooter className="grid gap-2">
        {problem !== "not-found" && (
          <Button type="button" size="lg" block onClick={onRetry}>
            {shopMessages.retry}
          </Button>
        )}
        <Button
          type="button"
          variant={problem === "not-found" ? "primary" : "secondary"}
          size="lg"
          block
          onClick={onClose}
        >
          {shopMessages.backToShop}
        </Button>
        {problem === "not-found" && (
          <WhatsAppButton
            message={shopMessages.askWhatsAppMessage}
            variant="secondary"
            size="lg"
            block
          >
            {shopMessages.askWhatsApp}
          </WhatsAppButton>
        )}
      </SheetFooter>
    </>
  );
}

function ProductDetails({
  product: p,
  onClose,
  onViewBag,
}: {
  product: PublicProduct;
  onClose: () => void;
  onViewBag: () => void;
}) {
  const choice = useProductChoice(p);

  return (
    <>
      <SheetHeader>
        <SheetTitle>{p.name}</SheetTitle>
        <SheetDescription>{categoryLabels[p.category]}</SheetDescription>
      </SheetHeader>

      <SheetBody className="pb-5">
        <ul
          aria-label={shopMessages.product.photos}
          className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-1 sm:-mx-6 sm:scroll-px-6 sm:px-6"
        >
          {(p.photos.length > 0 ? p.photos : [null]).map((photo, i) => (
            <li
              key={photo ?? "none"}
              className={cn(
                "relative aspect-4/5 shrink-0 snap-start overflow-hidden rounded-3xl bg-muted",
                p.photos.length > 1 ? "w-[82%]" : "w-full",
              )}
            >
              <ProductPhoto
                src={photo}
                alt={i === 0 ? p.name : ""}
                sizes="(min-width: 1024px) 400px, 90vw"
                priority={i === 0}
              />
            </li>
          ))}
        </ul>

        <ProductSummary product={p} />
        <ProductOptions product={p} choice={choice} />
        <ProductHelp product={p} size={choice.size} />
      </SheetBody>

      <SheetFooter>
        <div aria-live="polite">
          <AddToBag product={p} choice={choice}>
            <Button type="button" variant="secondary" size="lg" onClick={onClose}>
              {shopMessages.product.keepShopping}
            </Button>
            <Button type="button" variant="primary" size="lg" onClick={onViewBag}>
              <ShoppingBag aria-hidden /> {shopMessages.product.viewBag}
            </Button>
          </AddToBag>
        </div>
      </SheetFooter>
    </>
  );
}
