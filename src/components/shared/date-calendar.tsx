"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

// Local calendar dates as YYYY-MM-DD (the visitor's clock stands in for shop time).
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number) as [number, number, number];
  return new Date(y, m - 1, d);
};
const shift = (s: string, days: number) => {
  const d = parse(s);
  return iso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + days));
};
// Monday on or before / Sunday on or after a day.
const weekStart = (s: string) => shift(s, -((parse(s).getDay() + 6) % 7));
const weekEnd = (s: string) => shift(weekStart(s), 6);

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const monthName = new Intl.DateTimeFormat("en-GB", { month: "long" });
const monthShort = new Intl.DateTimeFormat("en-GB", { month: "short" });
const dayName = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

type Props = {
  /** Accessible name, e.g. "Collection day". */
  label: string;
  /** Marked ends of the range; either may be null. */
  start: string | null;
  end: string | null;
  /** The day being chosen right now (gets focus first). */
  active: string | null;
  isEnabled: (day: string) => boolean;
  onSelect: (day: string) => void;
  /** First and last day that can be chosen; the calendar shows the whole weeks around them. */
  from: string;
  to: string;
  /** Today, marked with a dot. */
  today?: string;
};

/**
 * Calendar for picking a day, showing just the weeks that matter (Monday first) as one grid that
 * runs across a month end, so there are no pages to flip. The 1st of a month carries its name.
 * Days that can't be booked are faded, the chosen days are filled and the days between are
 * shaded. One tab stop; arrow keys move a day or a week.
 */
export function DateCalendar({
  label,
  start,
  end,
  active,
  isEnabled,
  onSelect,
  from,
  to,
  today,
}: Props) {
  const [focusDay, setFocusDay] = useState<string | null>(null);
  const grid = useRef<HTMLFieldSetElement>(null);

  const days: string[] = [];
  for (let d = weekStart(from); d <= weekEnd(to); d = shift(d, 1)) days.push(d);

  const enabled = (day: string) => day >= from && day <= to && isEnabled(day);
  const tabDay =
    [focusDay, active, start, days.find(enabled)].find(
      (d): d is string => typeof d === "string" && days.includes(d),
    ) ?? null;

  const title =
    from.slice(0, 7) === to.slice(0, 7)
      ? `${monthName.format(parse(from))} ${from.slice(0, 4)}`
      : `${monthName.format(parse(from))} – ${monthName.format(parse(to))} ${to.slice(0, 4)}`;

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: string) {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = shift(day, step);
    if (!days.includes(next)) return;
    setFocusDay(next);
    grid.current?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)?.focus();
  }

  const between = (day: string) => start !== null && end !== null && day > start && day < end;
  const spans = start !== null && end !== null && start !== end;

  return (
    <div className="rounded-3xl bg-card p-3 shadow-card">
      <p className="px-1 pb-1 display text-subtitle">{title}</p>
      <fieldset ref={grid} className="grid min-w-0 grid-cols-7 gap-y-1 text-center">
        <legend className="sr-only">{label}</legend>
        {WEEKDAYS.map((w, i) => (
          <span
            key={i}
            aria-hidden
            className="py-1 text-caption font-semibold text-muted-foreground"
          >
            {w}
          </span>
        ))}
        {days.map((day) => {
          const on = enabled(day);
          const isEnd = day === start || day === end;
          const date = parse(day);
          return (
            <div
              key={day}
              className={cn(
                "flex justify-center",
                // The shaded band runs from the start day to the end day.
                (between(day) || (isEnd && spans)) && "bg-success-soft",
                spans && day === start && "rounded-l-full",
                spans && day === end && "rounded-r-full",
              )}
            >
              <button
                type="button"
                data-day={day}
                disabled={!on}
                aria-pressed={isEnd}
                aria-label={dayName.format(date)}
                tabIndex={day === tabDay ? 0 : -1}
                onClick={() => onSelect(day)}
                onKeyDown={(e) => onKeyDown(e, day)}
                className={cn(
                  "relative flex size-11 flex-col items-center justify-center rounded-full text-body-sm leading-none font-semibold figures outline-none",
                  "transition-[background-color,color,scale] duration-200 ease-out-expo focus-visible:ring-4 focus-visible:ring-ring/35",
                  isEnd
                    ? "bg-primary text-primary-foreground shadow-glow-primary"
                    : on
                      ? "text-foreground hover:bg-secondary active:scale-95"
                      : "text-muted-foreground/35",
                )}
              >
                {date.getDate()}
                {date.getDate() === 1 && (
                  <span aria-hidden className="mt-0.5 caps-label">
                    {monthShort.format(date)}
                  </span>
                )}
                {day === today && !isEnd && (
                  <span aria-hidden className="absolute bottom-1 size-1 rounded-full bg-clay" />
                )}
              </button>
            </div>
          );
        })}
      </fieldset>
    </div>
  );
}
