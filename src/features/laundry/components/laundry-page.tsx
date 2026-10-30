import { Sparkles, Truck, Wallet } from "lucide-react";
import { Suspense } from "react";

import { PerkList } from "@/components/shared/perk-list";

import { GoodToKnow } from "./good-to-know";
import { LaundryOrder, LaundryOrderFromUrl } from "./laundry-order";

const perks = [
  { icon: Truck, label: "Free pickup & delivery" },
  { icon: Sparkles, label: "Free ironing" },
  { icon: Wallet, label: "Pay on delivery" },
];

export function LaundryPage() {
  return (
    <>
      <section>
        <div className="container-page pt-8 pb-4 sm:pt-12 sm:pb-6 lg:pt-16 lg:pb-8">
          <h1 className="display text-display-lg">Book a laundry pickup</h1>
          <p className="mt-3 max-w-reading text-body-lg text-muted-foreground sm:mt-4">
            Tap what needs washing, pick your days and send it on WhatsApp. No forms to fill.
          </p>
          <PerkList perks={perks} className="mt-5" />
        </div>
      </section>

      {/* The category and dates live in the URL; until the client reads it, show everything. */}
      <Suspense fallback={<LaundryOrder params={null} />}>
        <LaundryOrderFromUrl />
      </Suspense>

      <GoodToKnow />
    </>
  );
}
