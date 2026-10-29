import { describe, expect, it } from "vite-plus/test";

import { resolveWhen } from "./when";

// Wednesday 28 Oct 2026.
const at = (hour: number) => new Date(2026, 9, 28, hour, 0);

describe("resolveWhen", () => {
  it("drops windows that have passed today and says so", () => {
    const when = resolveWhen({}, at(11));
    expect(when.pickup).toBe("2026-10-28");
    expect(when.windows.map((w) => w.id)).toEqual(["afternoon", "evening"]);
    expect(when.notes).toContain("Earlier times today have passed.");
    expect(when.choice).toBeNull();
  });

  it("skips a day with nothing left and starts tomorrow", () => {
    const when = resolveWhen({}, at(18));
    expect(when.days[0]?.iso).toBe("2026-10-29");
    expect(when.pickup).toBe("2026-10-29");
  });

  it("offers Sunday's shorter hours with a note", () => {
    const when = resolveWhen({ pickup: "2026-11-01" }, at(8));
    expect(when.windows.map((w) => w.id)).toEqual(["midday", "afternoon"]);
    expect(when.notes).toContain("We're open 9 AM–4 PM on Sun 1.");
  });

  it("removes same day after an afternoon pickup and falls back to next day", () => {
    const when = resolveWhen(
      { pickup: "2026-10-29", window: "afternoon", return: "same-day" },
      at(8),
    );
    expect(when.returns.map((r) => r.id)).toEqual(["next-day", "two-days"]);
    expect(when.choice).toEqual({ pickup: "2026-10-29", window: "afternoon", return: "next-day" });
    expect(when.notes).toContain("Same day needs a morning or midday pickup.");
  });

  it("hides same day before a time is picked when only late windows are left", () => {
    const when = resolveWhen({}, at(14));
    expect(when.windows.map((w) => w.id)).toEqual(["evening"]);
    expect(when.returns.map((r) => r.id)).toEqual(["next-day", "two-days"]);
    expect(when.notes).toContain("Same day needs a morning or midday pickup.");
  });
});
