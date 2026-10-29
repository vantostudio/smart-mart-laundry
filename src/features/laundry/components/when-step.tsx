"use client";

import { CloudSun, Sun, Sunrise, Sunset, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ChoiceChips, type ChoiceChipOption } from "@/components/shared/choice-chips";
import {
  formatDay,
  formatHour,
  type Booking,
  type ReturnId,
  type WindowId,
} from "@/features/booking/schedule";
import { resolveWhen } from "@/features/laundry/lib/when";

import { StepSection } from "./step-section";

export const WHEN_ID = "when";
export const WHEN_HEADING_ID = "when-heading";

const windowIcons: Record<WindowId, LucideIcon> = {
  morning: Sunrise,
  midday: Sun,
  afternoon: CloudSun,
  evening: Sunset,
};

type Props = {
  value: Partial<Booking>;
  /** Called on every tap; the parent keeps the draft and writes complete bookings to the URL. */
  onChange: (next: Partial<Booking>) => void;
  /** The visitor's clock; null during the server render. */
  now: Date | null;
  /** Shown after a send attempt without a pickup time. */
  error?: string;
};

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <p className="text-body-sm font-semibold">{label}</p>
      {children}
    </div>
  );
}

/**
 * Step 1: pickup day, time and return, applied as soon as they're tapped (no confirm button).
 * Only bookable options are offered; a short note says why earlier times or a same-day return
 * are missing. Before the clock is known (server render) it shows skeleton chips of the same size.
 */
export function WhenStep({ value, onChange, now, error }: Props) {
  const when = now ? resolveWhen(value, now) : null;

  return (
    <StepSection
      id={WHEN_ID}
      step={1}
      headingId={WHEN_HEADING_ID}
      title="When should we pick up?"
      intro="Free pickup and delivery anywhere in Chuka."
    >
      <div className="grid gap-5 rounded-3xl bg-card p-4 shadow-card sm:p-6">
        {when ? (
          <>
            <Group label="Pickup day">
              <ChoiceChips
                label="Pickup day"
                variant="date"
                layout="rail"
                options={when.days.map((d, i) => {
                  const [date, month] = d.date.split(" ");
                  return {
                    value: d.iso,
                    overline: formatDay(d.iso).split(" ")[0],
                    label: date,
                    sublabel: d.name === "Today" ? "Today" : d.name === "Tomorrow" ? "Tmrw" : month,
                    srLabel: `${i < 2 ? `${d.name}, ` : ""}${formatDay(d.iso, { month: true })}`,
                  };
                })}
                value={when.pickup}
                onChange={(pickup) => onChange({ ...value, pickup })}
                className="-mx-4 scroll-px-4 px-4 sm:mx-0 sm:px-0"
              />
            </Group>

            <Group label="Pickup time">
              <ChoiceChips
                label="Pickup time"
                variant="tile"
                options={when.windows.map((w): ChoiceChipOption<WindowId> => ({
                  value: w.id,
                  label: w.label,
                  sublabel: w.time,
                  icon: windowIcons[w.id],
                }))}
                value={when.slot}
                onChange={(window) => onChange({ ...value, pickup: when.pickup, window })}
                aria-invalid={error && !when.slot ? true : undefined}
                aria-describedby={error && !when.slot ? "when-error" : undefined}
                // A lone time (late in the day) takes the whole row instead of half of it.
                className={when.windows.length === 1 ? "grid-cols-1" : "@xl:grid-cols-4"}
              />
            </Group>

            <Group label="Back by">
              <ChoiceChips
                label="Back by"
                columns={when.returns.length === 3 ? 3 : 2}
                options={when.returns.map((r): ChoiceChipOption<ReturnId> => ({
                  value: r.id,
                  label: r.label,
                  sublabel: `${formatDay(r.iso)}, ${formatHour(r.byHour)}`,
                }))}
                value={when.returnId}
                onChange={(ret) =>
                  onChange({ ...value, pickup: when.pickup, window: when.slot, return: ret })
                }
              />
            </Group>

            {(when.notes.length > 0 || error) && (
              <div className="-mt-1 grid gap-1 text-caption" aria-live="polite">
                {error && !when.slot && (
                  <p id="when-error" className="font-semibold text-destructive">
                    {error}
                  </p>
                )}
                {when.notes.map((n) => (
                  <p key={n} className="text-muted-foreground">
                    {n}
                  </p>
                ))}
              </div>
            )}
          </>
        ) : (
          // Same footprint as the real chips, so nothing jumps when the clock arrives.
          <div aria-hidden className="grid animate-pulse gap-5">
            {[
              "flex gap-1.5 [&>span]:h-15 [&>span]:w-15 [&>span]:shrink-0",
              "grid grid-cols-2 gap-2 [&>span]:h-12",
              "grid grid-cols-3 gap-2 [&>span]:h-11",
            ].map((row) => (
              <div key={row} className="grid gap-2">
                <span className="h-4 w-24 rounded-full bg-secondary" />
                <div className={row}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <span key={i} className="rounded-xl bg-secondary" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StepSection>
  );
}
