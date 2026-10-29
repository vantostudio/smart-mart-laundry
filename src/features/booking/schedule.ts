/*
 * Pickup scheduling rules. Pure functions only, so the same logic can later run on the server
 * (Lovable Cloud) when bookings become real orders.
 *
 * Dates are calendar dates in the shop's local time (Africa/Nairobi, UTC+3, no daylight saving).
 * The site is static, so the visitor's clock stands in for local time: every helper reads local
 * date parts (getFullYear/getMonth/getDate), never UTC, so a booking made late at night never
 * slips to the wrong day.
 */

/** Opening hours as whole hours on a 24 h clock. Index 0 is Sunday (matches Date#getDay). */
export const openingHours: readonly { open: number; close: number }[] = [
  { open: 9, close: 16 }, // Sunday
  { open: 7, close: 20 }, // Monday
  { open: 7, close: 20 },
  { open: 7, close: 20 },
  { open: 7, close: 20 },
  { open: 7, close: 20 },
  { open: 7, close: 20 }, // Saturday
];

/** How many days ahead a pickup can be booked, today included. */
export const BOOKING_DAYS = 7;

/** A window can't be booked once we're this close to its start. */
export const LEAD_TIME_HOURS = 1;

/** Latest hour we deliver back on a normal day. */
export const RETURN_BY_HOUR = 19;

export const pickupWindows = [
  { id: "morning", label: "Morning", time: "7–10 AM", start: 7, end: 10 },
  { id: "midday", label: "Midday", time: "10 AM–1 PM", start: 10, end: 13 },
  { id: "afternoon", label: "Afternoon", time: "1–4 PM", start: 13, end: 16 },
  { id: "evening", label: "Evening", time: "4–7 PM", start: 16, end: 19 },
] as const;

export type PickupWindow = (typeof pickupWindows)[number];
export type WindowId = PickupWindow["id"];

export const returnOptions = [
  { id: "same-day", label: "Same day", days: 0 },
  { id: "next-day", label: "Next day", days: 1 },
  { id: "two-days", label: "2 days", days: 2 },
] as const;

export type ReturnId = (typeof returnOptions)[number]["id"];

/** Pickup windows that still allow a same-day return. */
const SAME_DAY_WINDOWS: readonly WindowId[] = ["morning", "midday"];

export const DEFAULT_RETURN: ReturnId = "next-day";

/** What the visitor has picked so far. Any field can be missing. */
export type Booking = {
  pickup: string | null;
  window: WindowId | null;
  return: ReturnId | null;
};

export type CompleteBooking = { pickup: string; window: WindowId; return: ReturnId };

export const emptyBooking: Booking = { pickup: null, window: null, return: null };

// ---------------------------------------------------------------------------------------------
// Calendar dates
// ---------------------------------------------------------------------------------------------

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Local midnight for a `YYYY-MM-DD` string, or null if it isn't a real date. */
export function fromIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(y, m - 1, d);
  // Rejects 2026-02-30 and friends, which Date would silently roll over.
  return toIsoDate(date) === iso ? date : null;
}

/** Calendar date `days` after `iso` (works across month and year ends). */
export function addDays(iso: string, days: number): string {
  const date = fromIsoDate(iso);
  if (!date) throw new Error(`Invalid date: ${iso}`);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
}

/** Whole days from `from` to `to`, both `YYYY-MM-DD`. */
export function daysBetween(from: string, to: string): number {
  const a = fromIsoDate(from);
  const b = fromIsoDate(to);
  if (!a || !b) return Number.NaN;
  // Date.UTC on the local parts sidesteps any daylight-saving hour in the visitor's zone.
  const utc = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((utc(b) - utc(a)) / 86_400_000);
}

function partsOf(iso: string) {
  const date = fromIsoDate(iso);
  if (!date) throw new Error(`Invalid date: ${iso}`);
  return {
    weekday: WEEKDAYS[date.getDay()]!,
    day: date.getDate(),
    month: MONTHS[date.getMonth()]!,
    dow: date.getDay(),
  };
}

/** "Thu 29", or "Thu 29 Oct" with `month`. */
export function formatDay(iso: string, { month = false }: { month?: boolean } = {}): string {
  const p = partsOf(iso);
  return month ? `${p.weekday} ${p.day} ${p.month}` : `${p.weekday} ${p.day}`;
}

/** 7 → "7 AM", 13 → "1 PM", 12 → "12 PM". */
export function formatHour(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${hour < 12 ? "AM" : "PM"}`;
}

export function hoursFor(iso: string): { open: number; close: number } {
  return openingHours[partsOf(iso).dow]!;
}

// ---------------------------------------------------------------------------------------------
// Days and windows
// ---------------------------------------------------------------------------------------------

export type WindowStatus = PickupWindow & { disabled: boolean; reason?: string };

/** Every window for a day, with the ones that can't be booked marked and explained. */
export function windowsFor(iso: string, now: Date): WindowStatus[] {
  const today = toIsoDate(now);
  const offset = daysBetween(today, iso);
  const { open, close } = hoursFor(iso);
  const hourNow = now.getHours() + now.getMinutes() / 60;

  return pickupWindows.map((w) => {
    if (Number.isNaN(offset) || offset < 0) return { ...w, disabled: true, reason: "Past" };
    if (w.start < open || w.end > close) return { ...w, disabled: true, reason: "Closed" };
    if (offset === 0 && hourNow > w.start - LEAD_TIME_HOURS) {
      return { ...w, disabled: true, reason: "Too late" };
    }
    return { ...w, disabled: false };
  });
}

export function isWindowAvailable(iso: string, window: WindowId, now: Date): boolean {
  return windowsFor(iso, now).some((w) => w.id === window && !w.disabled);
}

export type UpcomingDay = {
  iso: string;
  /** "Today", "Tomorrow" or "Fri 31". */
  label: string;
  /** "Today", "Tomorrow" or "Fri" — first line of a two-line chip. */
  name: string;
  /** "31 Oct" — second line of a two-line chip. */
  date: string;
  disabled: boolean;
  reason?: string;
};

/** The next `count` calendar days from today. A day is disabled when no window is left on it. */
export function upcomingDays(now: Date, count = BOOKING_DAYS): UpcomingDay[] {
  const today = toIsoDate(now);
  return Array.from({ length: count }, (_, i) => {
    const iso = addDays(today, i);
    const p = partsOf(iso);
    const name = i === 0 ? "Today" : i === 1 ? "Tomorrow" : p.weekday;
    const disabled = windowsFor(iso, now).every((w) => w.disabled);
    return {
      iso,
      label: i < 2 ? name : `${p.weekday} ${p.day}`,
      name,
      date: `${p.day} ${p.month}`,
      disabled,
      ...(disabled ? { reason: i === 0 ? "Too late" : "Closed" } : {}),
    };
  });
}

/** First bookable day, or null if none in the next `count` days. */
export function earliestDay(now: Date, count = BOOKING_DAYS): string | null {
  return upcomingDays(now, count).find((d) => !d.disabled)?.iso ?? null;
}

// ---------------------------------------------------------------------------------------------
// Returns
// ---------------------------------------------------------------------------------------------

export type ReturnStatus = {
  id: ReturnId;
  label: string;
  /** Calendar date the order comes back. */
  iso: string;
  /** Hour on that day we deliver by. */
  byHour: number;
  /** "Back Thu 30, by 7 PM". */
  detail: string;
  disabled: boolean;
  reason?: string;
};

export function sameDayAllowed(window: WindowId | null): boolean {
  return window === null || SAME_DAY_WINDOWS.includes(window);
}

/**
 * Return options for a pickup day. Delivery is by 7 PM, or by closing time on a short day
 * (Sunday closes at 4 PM). Same day only works for morning and midday pickups; with no window
 * picked yet it stays open.
 */
export function returnOptionsFor(pickup: string, window: WindowId | null): ReturnStatus[] {
  return returnOptions.map((r) => {
    const iso = addDays(pickup, r.days);
    const byHour = Math.min(RETURN_BY_HOUR, hoursFor(iso).close);
    const disabled = r.id === "same-day" && !sameDayAllowed(window);
    return {
      id: r.id,
      label: r.label,
      iso,
      byHour,
      detail: `Back ${formatDay(iso)}, by ${formatHour(byHour)}`,
      disabled,
      ...(disabled ? { reason: "Before 1 PM" } : {}),
    };
  });
}

export function returnFor(booking: CompleteBooking): ReturnStatus {
  return returnOptionsFor(booking.pickup, booking.window).find((r) => r.id === booking.return)!;
}

export function windowById(id: WindowId): PickupWindow {
  return pickupWindows.find((w) => w.id === id)!;
}

/** "Pickup Thu 29 · 7–10 AM · back Fri 30". */
export function bookingSummary(booking: CompleteBooking): string {
  const back = returnFor(booking);
  return `Pickup ${formatDay(booking.pickup)} · ${windowById(booking.window).time} · back ${formatDay(back.iso)}`;
}

// ---------------------------------------------------------------------------------------------
// URL contract: /laundry?pickup=2026-10-29&window=morning&return=next-day
// ---------------------------------------------------------------------------------------------

type ParamSource =
  | Pick<URLSearchParams, "get">
  | Record<string, string | string[] | undefined>
  | null
  | undefined;

function readParam(source: ParamSource, key: string): string | null {
  if (!source) return null;
  if (typeof (source as URLSearchParams).get === "function") {
    return (source as URLSearchParams).get(key);
  }
  const value = (source as Record<string, string | string[] | undefined>)[key];
  return (Array.isArray(value) ? value[0] : value) ?? null;
}

const isWindowId = (v: string | null): v is WindowId => pickupWindows.some((w) => w.id === v);
const isReturnId = (v: string | null): v is ReturnId => returnOptions.some((r) => r.id === v);

/**
 * Reads a booking from search params (URLSearchParams or Next's `searchParams` object).
 * Anything malformed, in the past, beyond the booking range or not offered on that day comes
 * back as null, so the visitor is simply asked again.
 */
export function parseBooking(source: ParamSource, now: Date = new Date()): Booking {
  const rawPickup = readParam(source, "pickup");
  const rawWindow = readParam(source, "window");
  const rawReturn = readParam(source, "return");

  let pickup: string | null = null;
  if (rawPickup && fromIsoDate(rawPickup)) {
    const offset = daysBetween(toIsoDate(now), rawPickup);
    if (offset >= 0 && offset < BOOKING_DAYS) pickup = rawPickup;
  }

  let window: WindowId | null = isWindowId(rawWindow) ? rawWindow : null;
  if (pickup && window && !isWindowAvailable(pickup, window, now)) window = null;
  if (!pickup && rawPickup) window = null; // a window on an invalid day means nothing

  let ret: ReturnId | null = isReturnId(rawReturn) ? rawReturn : null;
  if (ret === "same-day" && !sameDayAllowed(window)) ret = null;

  return { pickup, window, return: ret };
}

export function isCompleteBooking(booking: Booking | null | undefined): booking is CompleteBooking {
  return Boolean(booking?.pickup && booking.window && booking.return);
}

export function bookingParams(choice: CompleteBooking): URLSearchParams {
  return new URLSearchParams({
    pickup: choice.pickup,
    window: choice.window,
    return: choice.return,
  });
}

/** Link to the laundry page with the booking filled in. */
export function bookingHref(choice: CompleteBooking): `/laundry?${string}` {
  return `/laundry?${bookingParams(choice).toString()}`;
}
