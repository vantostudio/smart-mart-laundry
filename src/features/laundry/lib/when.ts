import {
  DEFAULT_RETURN,
  formatDay,
  formatHour,
  hoursFor,
  returnOptionsFor,
  sameDayAllowed,
  upcomingDays,
  windowsFor,
  type Booking,
  type CompleteBooking,
  type ReturnId,
} from "@/features/booking/schedule";

/**
 * Everything the "When" step shows, worked out from what the customer picked so far and the
 * clock. Only bookable options come back (closed days and past windows are dropped, with a note
 * saying why), and a stale choice (a window that has passed, a same-day return after an
 * afternoon pickup) falls back instead of needing an effect.
 */
export function resolveWhen(value: Partial<Booking>, now: Date) {
  const days = upcomingDays(now).filter((d) => !d.disabled);
  const pickup = (days.find((d) => d.iso === value.pickup) ?? days[0])?.iso ?? null;

  const allWindows = pickup ? windowsFor(pickup, now) : [];
  const windows = allWindows.filter((w) => !w.disabled);
  const slot = windows.find((w) => w.id === value.window)?.id ?? null;

  // With no time picked yet, same day is only offered if an open window still allows it.
  const sameDay = slot ? sameDayAllowed(slot) : windows.some((w) => sameDayAllowed(w.id));
  const returns = pickup
    ? returnOptionsFor(pickup, slot).filter((r) => !r.disabled && (sameDay || r.id !== "same-day"))
    : [];
  const wanted: ReturnId = value.return ?? DEFAULT_RETURN;
  const returnId: ReturnId = returns.some((r) => r.id === wanted) ? wanted : DEFAULT_RETURN;

  const notes: string[] = [];
  if (pickup && allWindows.some((w) => w.reason === "Too late")) {
    notes.push("Earlier times today have passed.");
  }
  if (pickup && allWindows.some((w) => w.reason === "Closed")) {
    const { open, close } = hoursFor(pickup);
    notes.push(`We're open ${formatHour(open)}–${formatHour(close)} on ${formatDay(pickup)}.`);
  }
  if (windows.length > 0 && !sameDay) notes.push("Same day needs a morning or midday pickup.");

  const choice: CompleteBooking | null =
    pickup && slot ? { pickup, window: slot, return: returnId } : null;

  return { days, pickup, windows, slot, returns, returnId, notes, choice };
}
