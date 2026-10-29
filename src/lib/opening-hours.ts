/** 0 = Sunday … 6 = Saturday, matching `Date#getDay`. */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** One block of opening hours; times are 24-hour "HH:MM" in the shop's time zone. */
export type OpeningPeriod = { days: readonly Weekday[]; open: string; close: string };
export type OpeningHours = readonly OpeningPeriod[];

export type OpenStatus = { open: boolean; label: string };

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const LONG_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

function toMinutes(time: string): number {
  const [h = 0, m = 0] = time.split(":").map(Number);
  return h * 60 + m;
}

/** "07:00" → "7 AM", "19:30" → "7:30 PM". */
export function formatTime(time: string): string {
  const total = toMinutes(time);
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h < 12 ? "AM" : "PM";
  return m === 0 ? `${hour12} ${suffix}` : `${hour12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Day of week and minutes since midnight for `date`, as seen in `timeZone`. */
export function zonedDayAndMinutes(
  date: Date,
  timeZone: string,
): { day: Weekday; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const day = SHORT_DAYS.indexOf(get("weekday") as (typeof SHORT_DAYS)[number]);
  return {
    day: (day < 0 ? date.getDay() : day) as Weekday,
    minutes: (Number(get("hour")) % 24) * 60 + Number(get("minute")),
  };
}

function periodFor(hours: OpeningHours, day: number): OpeningPeriod | undefined {
  return hours.find((p) => p.days.includes(day as Weekday));
}

/**
 * Whether the shop is open at `date` and a short line saying so:
 * "Open now, closes 8 PM", "Closed, opens 7 AM", "Closed, opens tomorrow 7 AM"
 * or "Closed, opens Monday 7 AM".
 */
export function getOpenStatus(date: Date, hours: OpeningHours, timeZone: string): OpenStatus {
  const { day, minutes } = zonedDayAndMinutes(date, timeZone);
  const today = periodFor(hours, day);

  if (today) {
    const open = toMinutes(today.open);
    const close = toMinutes(today.close);
    if (minutes >= open && minutes < close) {
      return { open: true, label: `Open now, closes ${formatTime(today.close)}` };
    }
    if (minutes < open) {
      return { open: false, label: `Closed, opens ${formatTime(today.open)}` };
    }
  }

  for (let ahead = 1; ahead <= 7; ahead++) {
    const next = (day + ahead) % 7;
    const period = periodFor(hours, next);
    if (!period) continue;
    const when = ahead === 1 ? "tomorrow" : LONG_DAYS[next];
    return { open: false, label: `Closed, opens ${when} ${formatTime(period.open)}` };
  }

  return { open: false, label: "Closed" };
}

/** One-line summary such as "Mon–Sat 7 AM–8 PM, Sun 9 AM–4 PM". Days in a period must be consecutive. */
export function formatHoursSummary(hours: OpeningHours): string {
  return hours
    .map(({ days, open, close }) => {
      const first = SHORT_DAYS[days[0] ?? 0];
      const last = SHORT_DAYS[days[days.length - 1] ?? 0];
      const range = days.length > 1 ? `${first}–${last}` : first;
      return `${range} ${formatTime(open)}–${formatTime(close)}`;
    })
    .join(", ");
}
