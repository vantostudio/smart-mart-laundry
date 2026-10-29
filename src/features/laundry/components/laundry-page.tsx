import { Sparkles, Truck, Wallet } from "lucide-react";
import { Suspense } from "react";

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
        <div className="container-page pt-8 pb-8 sm:pt-12 sm:pb-10 lg:pt-16 lg:pb-12">
          <h1 className="display text-display-lg">Book a laundry pickup</h1>
          <p className="mt-3 max-w-reading text-body-lg text-muted-foreground sm:mt-4">
            Pick a time, add what needs washing, and send the order on WhatsApp. It takes about a
            minute.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {perks.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1.5 text-body-sm font-medium shadow-card"
              >
                <Icon aria-hidden className="size-4 text-clay" /> {label}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The booking lives in the URL; until the client reads it, show the empty flow. */}
      <Suspense fallback={<LaundryOrder params={null} />}>
        <LaundryOrderFromUrl />
      </Suspense>

      <GoodToKnow />
    </>
  );
}
