"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type RefObject } from "react";

import { Section } from "@/components/shared/section";
import { bookingParams, parseBooking, type Booking } from "@/features/booking/schedule";
import { useNow } from "@/features/booking/use-now";
import { useCart } from "@/features/cart/cart-provider";
import { DEFAULT_NOTIFY, type LaundryCategory, type NotifyMethod } from "@/features/laundry/data";
import { buildPickupMessage } from "@/features/laundry/lib/pickup-message";
import { clearSavedDetails, readSavedDetails, writeSavedDetails } from "@/lib/saved-details";
import { revealById, revealElement } from "@/lib/scroll";
import { DEFAULT_TAB, parseTab } from "@/features/laundry/lib/tabs";
import { validateOrder, type OrderField } from "@/features/laundry/lib/validate-order";
import { resolveWhen } from "@/features/laundry/lib/when";

import { DetailsStep, type ContactField, type Details } from "./details-step";
import { ITEMS_HEADING_ID, LaundryItems } from "./laundry-items";
import { OrderSummary, SUMMARY_HEADING_ID, SUMMARY_ID } from "./order-summary";
import { StickyCartBar } from "./sticky-cart-bar";
import { WHEN_HEADING_ID, WHEN_ID, WhenStep } from "./when-step";

type Params = Pick<URLSearchParams, "get" | "has" | "toString"> | null;

const emptyDetails: Details = { location: "", name: "", phone: "", notes: "" };

/** Reads the booking from the URL. Must sit inside <Suspense> (useSearchParams). */
export function LaundryOrderFromUrl() {
  const searchParams = useSearchParams();
  return <LaundryOrder params={searchParams} />;
}

/**
 * The whole order on one page: 1 when, 2 what, 3 where, with the order summary beside the steps
 * on desktop and after them on phones. Every choice applies as it's tapped; a complete pickup
 * time is mirrored into the URL (`?pickup=…&window=…&return=…`) so the page can be shared or
 * reloaded. `params` is null in the Suspense fallback (static prerender).
 */
export function LaundryOrder({ params }: { params: Params }) {
  const router = useRouter();
  const nowMs = useNow();
  const now = nowMs === null ? null : new Date(nowMs);
  const { items, count } = useCart();

  // The customer's own choices win over the URL once they start tapping.
  const [draft, setDraft] = useState<Partial<Booking> | null>(null);
  const when: Partial<Booking> = draft ?? (now ? parseBooking(params, now) : {});
  const booking = now ? resolveWhen(when, now).choice : null;

  const [tab, setTab] = useState<LaundryCategory>(() => parseTab(params?.get("tab")));
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [remembered, setRemembered] = useState(false);
  const [notify, setNotify] = useState<NotifyMethod>(DEFAULT_NOTIFY);
  const [attempted, setAttempted] = useState(false);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const refs: Record<ContactField, RefObject<HTMLInputElement | null>> = {
    location: useRef<HTMLInputElement>(null),
    name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
  };

  useEffect(() => {
    // Saved details live in localStorage, which only exists after hydration.
    const saved = readSavedDetails();
    if (!saved) return;
    // oxlint-disable-next-line react/set-state-in-effect
    setDetails((d) => ({ ...d, ...saved }));
    setRemembered(true);
  }, []);

  const problems = validateOrder({ booking, itemCount: count, ...details });
  const missing = Object.entries(problems) as [OrderField, string][];
  const errors = attempted ? problems : {};
  const message = buildPickupMessage(items, { booking, ...details, notify });

  function changeWhen(next: Partial<Booking>) {
    setDraft(next);
    const choice = now ? resolveWhen(next, now).choice : null;
    if (!choice) return;
    const url = new URLSearchParams(params?.toString());
    for (const [key, value] of bookingParams(choice)) url.set(key, value);
    router.replace(`/laundry?${url.toString()}`, { scroll: false });
  }

  function changeTab(nextTab: LaundryCategory) {
    setTab(nextTab);
    // Remember the tab without a navigation; Next keeps useSearchParams in sync.
    const url = new URL(window.location.href);
    if (nextTab === DEFAULT_TAB) url.searchParams.delete("tab");
    else url.searchParams.set("tab", nextTab);
    window.history.replaceState(window.history.state, "", url);
  }

  function changeDetail(field: keyof Details, value: string) {
    setDetails((d) => ({ ...d, [field]: value }));
  }

  function forgetDetails() {
    clearSavedDetails();
    setDetails((d) => ({ ...emptyDetails, notes: d.notes }));
    setRemembered(false);
  }

  function fix(field: OrderField) {
    if (field === "when") revealById(WHEN_ID, WHEN_HEADING_ID);
    else if (field === "items") revealById("items", ITEMS_HEADING_ID);
    else revealElement(refs[field].current);
  }

  function send(event: MouseEvent<HTMLAnchorElement>) {
    const first = missing[0]?.[0];
    if (first) {
      event.preventDefault();
      setAttempted(true);
      fix(first);
      return;
    }
    // Valid: the link opens WhatsApp. Remember the contact details for next time.
    writeSavedDetails({ location: details.location, name: details.name, phone: details.phone });
    setSentMessage(message);
  }

  return (
    <Section
      spacing="bottom"
      containerClassName="grid grid-cols-1 gap-10 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-x-10 xl:grid-cols-[minmax(0,1fr)_24rem]"
    >
      <div className="grid min-w-0 grid-cols-1 content-start gap-10 sm:gap-12">
        <WhenStep value={when} onChange={changeWhen} now={now} error={errors.when} />
        <LaundryItems tab={tab} onTabChange={changeTab} error={errors.items} />
        <DetailsStep
          details={details}
          onChange={changeDetail}
          notify={notify}
          onNotifyChange={setNotify}
          errors={errors}
          refs={refs}
          remembered={remembered}
          onForget={forgetDetails}
        />
      </div>

      <OrderSummary
        booking={booking}
        missing={missing}
        onFix={fix}
        message={message}
        onSend={send}
        // A change after sending means the WhatsApp message is out of date.
        sent={sentMessage === message}
      />

      <StickyCartBar targetId={SUMMARY_ID} focusId={SUMMARY_HEADING_ID} />
    </Section>
  );
}
