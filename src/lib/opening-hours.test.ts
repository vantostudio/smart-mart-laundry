import { describe, expect, it } from "vite-plus/test";

import { site } from "@/config/site";

import { formatHoursSummary, formatTime, getOpenStatus } from "./opening-hours";

// Nairobi is UTC+3 all year. 2026-10-26 is a Monday, 2026-10-31 a Saturday, 2026-11-01 a Sunday.
const at = (iso: string) => new Date(`${iso}+03:00`);
const status = (iso: string) => getOpenStatus(at(iso), site.openingHours, site.timeZone);

describe("getOpenStatus", () => {
  it("is open during weekday hours", () => {
    expect(status("2026-10-26T07:00:00")).toEqual({ open: true, label: "Open now, closes 8 PM" });
    expect(status("2026-10-26T19:59:00")).toEqual({ open: true, label: "Open now, closes 8 PM" });
  });

  it("says when it opens later today", () => {
    expect(status("2026-10-26T06:30:00")).toEqual({ open: false, label: "Closed, opens 7 AM" });
    expect(status("2026-11-01T08:00:00")).toEqual({ open: false, label: "Closed, opens 9 AM" });
  });

  it("says it opens tomorrow after closing", () => {
    expect(status("2026-10-26T20:00:00").label).toBe("Closed, opens tomorrow 7 AM");
    expect(status("2026-10-31T21:00:00").label).toBe("Closed, opens tomorrow 9 AM");
    expect(status("2026-11-01T16:00:00").label).toBe("Closed, opens tomorrow 7 AM");
  });

  it("uses Sunday hours on Sunday", () => {
    expect(status("2026-11-01T15:00:00")).toEqual({ open: true, label: "Open now, closes 4 PM" });
  });

  it("reads the clock in the shop's time zone, not the device's", () => {
    // 04:30 UTC on Monday is 07:30 in Nairobi.
    expect(
      getOpenStatus(new Date("2026-10-26T04:30:00Z"), site.openingHours, site.timeZone).open,
    ).toBe(true);
  });

  it("names the weekday when the next opening is further away", () => {
    const weekdaysOnly = [{ days: [1, 2, 3, 4, 5], open: "08:00", close: "17:00" }] as const;
    expect(getOpenStatus(at("2026-10-31T10:00:00"), weekdaysOnly, site.timeZone).label).toBe(
      "Closed, opens Monday 8 AM",
    );
  });
});

describe("formatTime", () => {
  it("formats 24-hour times in 12-hour style", () => {
    expect(formatTime("00:00")).toBe("12 AM");
    expect(formatTime("12:00")).toBe("12 PM");
    expect(formatTime("19:30")).toBe("7:30 PM");
  });
});

describe("formatHoursSummary", () => {
  it("matches the published hours", () => {
    expect(formatHoursSummary(site.openingHours)).toBe("Mon–Sat 7 AM–8 PM, Sun 9 AM–4 PM");
  });
});
