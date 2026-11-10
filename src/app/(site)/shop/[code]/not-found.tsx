import { PackageOpen } from "lucide-react";
import Link from "next/link";

import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { shopMessages } from "@/features/shop/messages";

/** Sold out, deleted or never existed. The status is a real 404 (see `page.tsx`). */
export default function ProductNotFound() {
  const { title, body } = shopMessages.item["not-found"];
  return (
    <div className="container-page py-section">
      <div className="grid justify-items-center gap-3 rounded-3xl bg-card px-5 py-12 text-center shadow-card">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <PackageOpen aria-hidden className="size-6" />
        </span>
        <h1 className="display text-title">{title}</h1>
        <p className="max-w-sm text-body-sm text-muted-foreground">{body}</p>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          <Button asChild variant="primary" size="lg">
            <Link href="/shop">{shopMessages.backToShop}</Link>
          </Button>
          <WhatsAppButton message={shopMessages.askWhatsAppMessage} variant="secondary" size="lg">
            {shopMessages.askWhatsApp}
          </WhatsAppButton>
        </div>
      </div>
    </div>
  );
}
