"use client";

import Link from "next/link";

import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { Button } from "@/components/ui/button";
import { LoadProblemNotice } from "@/features/shop/components/load-problem";
import { shopMessages } from "@/features/shop/messages";

/** The product couldn't be read (database or storage down): say so, never "no longer available". */
export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page py-section">
      <LoadProblemNotice {...shopMessages.item.unavailable} onRetry={reset}>
        <Button asChild variant="secondary" size="lg">
          <Link href="/shop">{shopMessages.backToShop}</Link>
        </Button>
        <WhatsAppButton message={shopMessages.askWhatsAppMessage} variant="secondary" size="lg">
          {shopMessages.askWhatsApp}
        </WhatsAppButton>
      </LoadProblemNotice>
    </div>
  );
}
