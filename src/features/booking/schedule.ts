/*
 * Collection and return date rules. Pure functions only, so the same logic can later run on the server
 * when bookings become real orders.
 *
 * Dates are calendar dates in the shop's local time (Africa/Nairobi, UTC+3, no daylight saving).
 * The site is static, so the visitor's clock stands in for local time: every helper reads local
 * date parts (getFullYear/getMonth/getDate), never UTC, so a booking made late at night never
 * slips to the wrong day.
 */

import { site } from "@/config/site";
import type { Weekday } from "@/lib/opening-hours";

/** Opening hours in whole hours (24 h clock) from the site config, indexed by Date#getDay. */
const openingHours = Array.from({ length: 7 }, (_, day) => {
  const period = site.openingHours.find((p) => p.days.includes(day as Weekday))!;
  return { open: parseInt(period.open, 10), close: parseInt(period.close, 10) };
});

/** How many days ahead a collection can be booked, today included. */
export const COLLECTION_DAYS = 14;

/** Latest return: this many days after collection. */
export const RETURN_WITHIN = 7;

/** Today can be booked until this many hours before closing. */
const LEAD_TIME_HOURS = 1;

/** Collection and return dates (`YYYY-MM-DD`), either still missing. */
export type BookingDates = { pickup: string | null; back: string | null };

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

export function hoursFor(iso: string): { open: number; close: number } {
  return openingHours[partsOf(iso).dow]!;
}

// ---------------------------------------------------------------------------------------------
// Collection and return rules
// ---------------------------------------------------------------------------------------------

/** First day a collection can be booked: today until an hour before closing, then tomorrow. */
export function firstCollectionDay(now: Date): string {
  const today = toIsoDate(now);
  const cutOff = hoursFor(today).close - LEAD_TIME_HOURS;
  return now.getHours() < cutOff ? today : addDays(today, 1);
}

/** Bookable collection day: from the first open day up to COLLECTION_DAYS from today. */
export function isCollectionDay(iso: string, now: Date): boolean {
  const today = toIsoDate(now);
  return (
    daysBetween(firstCollectionDay(now), iso) >= 0 && daysBetween(today, iso) < COLLECTION_DAYS
  );
}

/** Return on the collection day itself (needs a morning collection) up to a week later. */
export function isReturnDay(iso: string, pickup: string): boolean {
  const offset = daysBetween(pickup, iso);
  return offset >= 0 && offset <= RETURN_WITHIN;
}

/** Same-day return is offered, but only works for a morning collection; the order says so. */
export const isSameDay = (d: BookingDates) => d.pickup !== null && d.pickup === d.back;

// ---------------------------------------------------------------------------------------------
// URL: /laundry?pickup=2026-10-29&back=2026-10-30
// ---------------------------------------------------------------------------------------------

type ParamSource = Pick<URLSearchParams, "get"> | null | undefined;

/** Dates from the URL, dropping any that can no longer be booked. */
export function parseDates(params: ParamSource, now: Date): BookingDates {
  const pickupParam = params?.get("pickup") ?? null;
  const pickup =
    pickupParam && fromIsoDate(pickupParam) && isCollectionDay(pickupParam, now)
      ? pickupParam
      : null;
  const backParam = params?.get("back") ?? null;
  const back =
    pickup && backParam && fromIsoDate(backParam) && isReturnDay(backParam, pickup)
      ? backParam
      : null;
  return { pickup, back };
}

export function dateParams(d: BookingDates): [string, string][] {
  return [
    ...(d.pickup ? ([["pickup", d.pickup]] as [string, string][]) : []),
    ...(d.back ? ([["back", d.back]] as [string, string][]) : []),
  ];
}
