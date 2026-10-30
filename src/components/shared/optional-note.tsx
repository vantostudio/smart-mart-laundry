"use client";

import { MessageSquarePlus } from "lucide-react";
import { useId, useState } from "react";

import { Textarea } from "@/components/ui/textarea";

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** What the note is for, e.g. "Hostel, gate or landmark". */
  placeholder: string;
};

/**
 * Typing is optional: a quiet "Add a note" link that opens a small box. Stays open once it has
 * text, so a note is never hidden.
 */
export function OptionalNote({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(value !== "");
  const id = useId();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center gap-2 text-body-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        <MessageSquarePlus aria-hidden className="size-4 text-clay" /> Add a note (optional)
      </button>
    );
  }

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-body-sm font-semibold">
        Note (optional)
      </label>
      <Textarea
        id={id}
        // Opened on purpose by tapping "Add a note", so the box takes focus straight away.
        ref={(el) => {
          if (el && !value) el.focus();
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        maxLength={200}
        placeholder={placeholder}
      />
    </div>
  );
}
