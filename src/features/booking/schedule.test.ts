import { describe, expect, it } from "vite-plus/test";

import {
  addDays,
  dateParams,
  daysBetween,
  firstCollectionDay,
  formatDay,
  fromIsoDate,
  isCollectionDay,
  isReturnDay,
  isSameDay,
  parseDates,
  toIsoDate,
} from "./schedule";

/** Local wall-clock time, the way a visitor's browser in Chuka sees it. */
const at = (iso: string, hour = 0, minute = 0) => {
  const [y, m, d] = iso.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d, hour, minute);
};

// 2026-10-28 is a Wednesday (open until 8 PM); 2026-11-01 is a Sunday (until 4 PM).
const WED = "2026-10-28";
const SUN = "2026-11-01";

describe("calendar dates", () => {
  it("round-trips local dates and rejects impossible ones", () => {
    expect(toIsoDate(at(WED, 23, 59))).toBe(WED);
    expect(fromIsoDate("2026-02-30")).toBeNull();
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(daysBetween(WED, SUN)).toBe(4);
    expect(formatDay(WED)).toBe("Wed 28");
    expect(formatDay(WED, { month: true })).toBe("Wed 28 Oct");
  });
});

describe("collection days", () => {
  it("offers today until an hour before closing, then starts tomorrow", () => {
    expect(firstCollectionDay(at(WED, 18, 59))).toBe(WED);
    expect(firstCollectionDay(at(WED, 19))).toBe("2026-10-29");
    // Sunday closes at 4 PM.
    expect(firstCollectionDay(at(SUN, 15))).toBe("2026-11-02");
  });

  it("allows two weeks ahead and nothing in the past", () => {
    const now = at(WED, 9);
    expect(isCollectionDay(WED, now)).toBe(true);
    expect(isCollectionDay(addDays(WED, 13), now)).toBe(true);
    expect(isCollectionDay(addDays(WED, 14), now)).toBe(false);
    expect(isCollectionDay(addDays(WED, -1), now)).toBe(false);
  });
});

describe("return days", () => {
  it("runs from the collection day to a week later", () => {
    expect(isReturnDay(WED, WED)).toBe(true);
    expect(isReturnDay(addDays(WED, 7), WED)).toBe(true);
    expect(isReturnDay(addDays(WED, 8), WED)).toBe(false);
    expect(isReturnDay(addDays(WED, -1), WED)).toBe(false);
    expect(isSameDay({ pickup: WED, back: WED })).toBe(true);
    expect(isSameDay({ pickup: WED, back: null })).toBe(false);
  });
});

describe("dates in the URL", () => {
  it("round-trips and drops dates that can't be booked", () => {
    const now = at(WED, 9);
    const dates = { pickup: "2026-10-29", back: "2026-10-31" };
    expect(parseDates(new URLSearchParams(dateParams(dates)), now)).toEqual(dates);
    expect(parseDates(new URLSearchParams("pickup=2026-10-01&back=2026-10-02"), now)).toEqual({
      pickup: null,
      back: null,
    });
    // A return before collection is dropped; the collection stays.
    expect(parseDates(new URLSearchParams("pickup=2026-10-30&back=2026-10-29"), now)).toEqual({
      pickup: "2026-10-30",
      back: null,
    });
    expect(dateParams({ pickup: null, back: null })).toEqual([]);
  });
});
