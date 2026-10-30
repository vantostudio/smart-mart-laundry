"use client";

import { Building2, GraduationCap, House, type LucideIcon } from "lucide-react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { site } from "@/config/site";

// Short labels so three fit side by side on a 320px phone; screen readers get the full name.
const display: Record<string, { label: string; icon: LucideIcon }> = {
  "Chuka University": { label: "University", icon: GraduationCap },
  Ndagani: { label: "Ndagani", icon: House },
  "Chuka town": { label: "Town", icon: Building2 },
};

type Props = {
  value: string | null;
  onChange: (area: string) => void;
  id?: string;
  "aria-invalid"?: boolean;
};

/** "Where?" as three big buttons, one per area we serve, so nobody has to type an address. */
export function AreaPicker({ value, onChange, id, ...aria }: Props) {
  return (
    <div id={id} className="scroll-mt-24">
      <ChoiceChips
        label="Your area"
        columns={3}
        options={site.areas.map((area) => ({
          value: area,
          label: display[area]?.label ?? area,
          srLabel: area,
          icon: display[area]?.icon ?? House,
        }))}
        value={value}
        onChange={onChange}
        {...aria}
      />
    </div>
  );
}
