"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";

import { ProblemText } from "@/features/admin/components/problem-text";
import { problemFrom, type Problem, type Result } from "@/features/admin/lib/api-call";
import { settingsMessages } from "@/features/admin/messages";
import { Button } from "@/components/ui/button";

/** An empty box is NaN, which JSON sends as null and the API names as the field to fix. */
export const amount = (value: string) => (value.trim() === "" ? Number.NaN : Number(value));

/** One titled panel on the settings page. */
export function SettingsPanel({
  heading,
  body,
  children,
}: {
  heading: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-3xl border border-border bg-card p-5 shadow-card sm:p-6">
      <h2 className="display text-title">{heading}</h2>
      <p className="mt-1 text-body-sm text-muted-foreground">{body}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/**
 * Sends a form and tracks how it went. On success the page reloads its server data. On failure it
 * goes to the field at fault, or the message, which can be off screen on a phone. Put `form` and
 * `onChange={edited}` on the `<form>`, so "Saved" doesn't stay beside changes that aren't.
 */
export function useSave<T>(save: () => Promise<Result<T>>) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [failure, setFailure] = useState<Problem | null>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!failure) return;
    const field = form.current?.querySelector(`[data-field="${failure.field}"]`);
    field?.querySelector<HTMLElement>("input, select, textarea")?.focus();
    (field ?? form.current?.querySelector('[role="alert"]'))?.scrollIntoView?.({ block: "center" });
  }, [failure]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setFailure(null);
    const result = await save();
    setSaving(false);
    if (result.ok) {
      setSaved(true);
      router.refresh();
    } else {
      setFailure(problemFrom(result.error));
    }
    return result;
  }

  return { saving, saved, failure, submit, form, edited: () => setSaved(false) };
}

/** The Save button with what happened next to it. */
export function SaveRow({
  saving,
  saved,
  savedText,
  general,
}: {
  saving: boolean;
  saved: boolean;
  savedText: string;
  /** A failure no field claimed. */
  general: Problem | null;
}) {
  return (
    <div className="grid gap-2">
      {general && <ProblemText problem={general} />}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? settingsMessages.saving : settingsMessages.save}
        </Button>
        <p aria-live="polite" className="text-body-sm font-semibold text-success">
          {saved && savedText}
        </p>
      </div>
    </div>
  );
}
