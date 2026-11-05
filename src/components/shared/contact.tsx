"use client";

import type { ComponentProps } from "react";

import { hoursRows, phoneDisplay, phoneHref } from "@/config/shop-settings";
import { useOpeningHours, useShopSettings } from "@/features/settings/shop-settings-provider";
import { formatHoursSummary } from "@/lib/opening-hours";
import { WHATSAPP_ORDER_DEFAULT, waLink } from "@/lib/whatsapp";

/*
 * Phone and hours for server components, which can't read the live settings themselves. Each renders
 * only what it replaces, so the page around it stays static.
 */

/** A link that calls the shop. Named for screen readers unless it shows the number itself. */
export function PhoneLink({
  showsNumber,
  ...props
}: ComponentProps<"a"> & { showsNumber?: boolean }) {
  const { phone } = useShopSettings();
  return (
    <a
      href={phoneHref(phone)}
      aria-label={showsNumber ? undefined : `Call ${phoneDisplay(phone)}`}
      {...props}
    />
  );
}

export function PhoneNumber() {
  return phoneDisplay(useShopSettings().phone);
}

/** A link that opens WhatsApp with a message ready to send, in a new tab. */
export function WhatsAppLink({
  message = WHATSAPP_ORDER_DEFAULT,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { message?: string }) {
  const { phone } = useShopSettings();
  return <a href={waLink(phone, message)} target="_blank" rel="noreferrer" {...props} />;
}

/** "Mon–Sat 7 AM–8 PM, Sun 9 AM–4 PM". */
export function HoursSummary() {
  return formatHoursSummary(useOpeningHours());
}

/** "Monday – Saturday: 7:00 AM – 8:00 PM · Sunday: 9:00 AM – 4:00 PM". */
export function HoursLine() {
  return hoursRows(useShopSettings())
    .map((h) => `${h.days}: ${h.time}`)
    .join(" · ");
}

/** One paragraph per set of days. */
export function HoursLines() {
  return hoursRows(useShopSettings()).map((h) => (
    <p key={h.days}>
      {h.days}: {h.time}
    </p>
  ));
}

/** Days over times, for a `dl`. */
export function HoursGrid() {
  return hoursRows(useShopSettings()).map((h) => (
    <div key={h.days}>
      <dt className="text-caption text-muted-foreground">{h.days}</dt>
      <dd className="font-semibold">{h.time}</dd>
    </div>
  ));
}
