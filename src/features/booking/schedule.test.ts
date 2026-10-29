import { describe, expect, it } from "vite-plus/test";

import {
  addDays,
  bookingHref,
  bookingSummary,
  daysBetween,
  earliestDay,
  formatDay,
  formatHour,
  fromIsoDate,
  isCompleteBooking,
  parseBooking,
  returnOptionsFor,
  toIsoDate,
  upcomingDays,
  windowsFor,
} from "./schedule";

/** Local wall-clock time, the way a visitor's browser in Chuka sees it. */
const at = (iso: string, hour = 0, minute = 0) => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d, hour, minute);
};

// 2026-10-28 is a Wednesday; 2026-11-01 is a Sunday.
const WED = "2026-10-28";
const SUN = "2026-11-01";

const disabledIds = (iso: string, now: Date) =>
  windowsFor(iso, now)
    .filter((w) => w.disabled)
    .map((w) => w.id);

describe("calendar dates", () => {
  it("formats local dates without shifting to UTC", () => {
    // 23:30 local is still the 28th even where that instant is already the 29th in UTC+0.
    expect(toIsoDate(at(WED, 23, 30))).toBe(WED);
    expect(toIsoDate(at(WED, 0, 5))).toBe(WED);
  });

  it("rejects malformed and impossible dates", () => {
    expect(fromIsoDate("2026-02-30")).toBeNull();
    expect(fromIsoDate("2026-13-01")).toBeNull();
    expect(fromIsoDate("29-10-2026")).toBeNull();
    expect(fromIsoDate("")).toBeNull();
    expect(fromIsoDate("2026-10-29")?.getDate()).toBe(29);
  });

  it("adds days across month and year ends", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(daysBetween("2026-12-30", "2027-01-02")).toBe(3);
  });

  it("formats days and hours", () => {
    expect(formatDay("2026-10-30")).toBe("Fri 30");
    expect(formatDay("2026-10-30", { month: true })).toBe("Fri 30 Oct");
    expect(formatHour(7)).toBe("7 AM");
    expect(formatHour(12)).toBe("12 PM");
    expect(formatHour(19)).toBe("7 PM");
  });
});

describe("windowsFor", () => {
  it("offers every window on a weekday ahead", () => {
    expect(disabledIds("2026-10-29", at(WED, 12))).toEqual([]);
  });

  it("offers only midday and afternoon on Sunday, explaining the rest", () => {
    const windows = windowsFor(SUN, at(WED, 12));
    expect(windows.filter((w) => !w.disabled).map((w) => w.id)).toEqual(["midday", "afternoon"]);
    expect(windows.find((w) => w.id === "morning")).toMatchObject({
      disabled: true,
      reason: "Closed",
    });
    expect(windows.find((w) => w.id === "evening")?.reason).toBe("Closed");
  });

  it("closes today's windows within an hour of their start", () => {
    expect(disabledIds(WED, at(WED, 6, 0))).toEqual([]);
    expect(disabledIds(WED, at(WED, 6, 1))).toEqual(["morning"]);
    expect(disabledIds(WED, at(WED, 12, 30))).toEqual(["morning", "midday", "afternoon"]);
    expect(windowsFor(WED, at(WED, 12, 30))[0]?.reason).toBe("Too late");
  });

  it("disables everything on a past day", () => {
    expect(disabledIds("2026-10-27", at(WED, 8))).toHaveLength(4);
  });
});

describe("upcomingDays", () => {
  it("lists seven days with Today and Tomorrow labels", () => {
    const days = upcomingDays(at(WED, 8));
    expect(days).toHaveLength(7);
    expect(days.map((d) => d.label)).toEqual([
      "Today",
      "Tomorrow",
      "Fri 30",
      "Sat 31",
      "Sun 1",
      "Mon 2",
      "Tue 3",
    ]);
    expect(days[0]).toMatchObject({ iso: WED, name: "Today", date: "28 Oct", disabled: false });
    expect(days[2]).toMatchObject({ name: "Fri", date: "30 Oct" });
  });

  it("disables today once no window is left", () => {
    const days = upcomingDays(at(WED, 15, 30), 2);
    expect(days[0]).toMatchObject({ disabled: true, reason: "Too late" });
    expect(days[1]?.disabled).toBe(false);
    expect(earliestDay(at(WED, 15, 30))).toBe("2026-10-29");
  });

  it("keeps today open while the evening window is more than an hour away", () => {
    expect(upcomingDays(at(WED, 14, 59), 1)[0]?.disabled).toBe(false);
  });

  it("handles a late-night Sunday", () => {
    const days = upcomingDays(at(SUN, 22), 2);
    expect(days[0]).toMatchObject({ iso: SUN, disabled: true });
    expect(days[1]).toMatchObject({ iso: "2026-11-02", label: "Tomorrow", disabled: false });
  });
});

describe("returnOptionsFor", () => {
  it("labels each option with its actual date", () => {
    const options = returnOptionsFor("2026-10-29", "morning");
    expect(options.map((o) => o.detail)).toEqual([
      "Back Thu 29, by 7 PM",
      "Back Fri 30, by 7 PM",
      "Back Sat 31, by 7 PM",
    ]);
    expect(options.every((o) => !o.disabled)).toBe(true);
  });

  it("only allows same day for morning and midday pickups", () => {
    expect(returnOptionsFor("2026-10-29", "midday")[0]?.disabled).toBe(false);
    expect(returnOptionsFor("2026-10-29", "afternoon")[0]).toMatchObject({
      id: "same-day",
      disabled: true,
    });
    expect(returnOptionsFor("2026-10-29", "evening")[0]?.disabled).toBe(true);
    expect(returnOptionsFor("2026-10-29", null)[0]?.disabled).toBe(false);
  });

  it("brings Sunday returns back by closing time", () => {
    expect(returnOptionsFor("2026-10-31", "morning")[1]).toMatchObject({
      iso: SUN,
      detail: "Back Sun 1, by 4 PM",
    });
  });
});

describe("parseBooking", () => {
  const now = at(WED, 8);
  const params = (q: string) => new URLSearchParams(q);

  it("reads a valid booking", () => {
    expect(parseBooking(params("pickup=2026-10-29&window=morning&return=next-day"), now)).toEqual({
      pickup: "2026-10-29",
      window: "morning",
      return: "next-day",
    });
  });

  it("accepts Next's searchParams object", () => {
    expect(
      parseBooking({ pickup: ["2026-10-29", "x"], window: "midday", return: "same-day" }, now),
    ).toEqual({ pickup: "2026-10-29", window: "midday", return: "same-day" });
  });

  it("drops past, far-off and malformed days", () => {
    expect(parseBooking(params("pickup=2026-10-27&window=midday"), now).pickup).toBeNull();
    expect(parseBooking(params("pickup=2026-11-04"), now).pickup).toBeNull();
    expect(parseBooking(params("pickup=2026-11-03"), now).pickup).toBe("2026-11-03");
    expect(parseBooking(params("pickup=tomorrow&window=midday"), now)).toEqual({
      pickup: null,
      window: null,
      return: null,
    });
  });

  it("drops windows that aren't offered that day", () => {
    expect(parseBooking(params(`pickup=${SUN}&window=morning`), now).window).toBeNull();
    expect(parseBooking(params(`pickup=${WED}&window=morning`), at(WED, 9)).window).toBeNull();
    expect(parseBooking(params("pickup=2026-10-29&window=night"), now).window).toBeNull();
  });

  it("drops a same-day return after a late pickup", () => {
    expect(
      parseBooking(params("pickup=2026-10-29&window=evening&return=same-day"), now).return,
    ).toBeNull();
    expect(parseBooking(params("return=soon"), now).return).toBeNull();
  });

  it("handles empty input", () => {
    expect(parseBooking(null, now)).toEqual({ pickup: null, window: null, return: null });
  });
});

describe("booking links and summaries", () => {
  const choice = { pickup: "2026-10-29", window: "morning", return: "next-day" } as const;

  it("round-trips through the URL", () => {
    const href = bookingHref(choice);
    expect(href).toBe("/laundry?pickup=2026-10-29&window=morning&return=next-day");
    expect(parseBooking(new URL(href, "https://x.test").searchParams, at(WED, 8))).toEqual(choice);
  });

  it("knows when a booking is complete", () => {
    expect(isCompleteBooking(choice)).toBe(true);
    expect(isCompleteBooking({ ...choice, window: null })).toBe(false);
    expect(isCompleteBooking(null)).toBe(false);
  });

  it("summarises a booking in one line", () => {
    expect(bookingSummary(choice)).toBe("Pickup Thu 29 · 7–10 AM · back Fri 30");
  });
});
