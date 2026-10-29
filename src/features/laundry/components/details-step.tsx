"use client";

import {
  BellRing,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  type LucideIcon,
} from "lucide-react";
import type { ChangeEvent, RefObject } from "react";

import { ChoiceChips } from "@/components/shared/choice-chips";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { notifyOption, notifyOptions, type NotifyMethod } from "@/features/laundry/data";
import type { OrderField } from "@/features/laundry/lib/validate-order";

import { StepSection } from "./step-section";

export const DETAILS_ID = "details";
export const DETAILS_HEADING_ID = "details-heading";

export type ContactField = Extract<OrderField, "location" | "name" | "phone">;
export type Details = Record<ContactField | "notes", string>;

const NOTIFY_LABEL = "How should we tell you it's ready?";
const notifyIcons: Record<NotifyMethod, LucideIcon> = {
  whatsapp: MessageCircle,
  sms: MessageSquareText,
  call: PhoneCall,
};

type Props = {
  details: Details;
  onChange: (field: keyof Details, value: string) => void;
  notify: NotifyMethod;
  onNotifyChange: (value: NotifyMethod) => void;
  /** Inline messages, only after a send attempt. */
  errors: Partial<Record<OrderField, string>>;
  refs: Record<ContactField, RefObject<HTMLInputElement | null>>;
  /** The fields were filled from this phone's saved details. */
  remembered: boolean;
  onForget: () => void;
};

/** Step 3: where to collect, who to ask for, notes, and how to hear the order is ready. */
export function DetailsStep({
  details,
  onChange,
  notify,
  onNotifyChange,
  errors,
  refs,
  remembered,
  onForget,
}: Props) {
  const input = (name: ContactField) => ({
    ref: refs[name],
    value: details[name],
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange(name, e.target.value),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  const error = (name: ContactField) =>
    errors[name] && (
      <p id={`${name}-error`} className="-mt-1.5 text-caption font-semibold text-destructive">
        {errors[name]}
      </p>
    );

  return (
    <StepSection
      id={DETAILS_ID}
      step={3}
      headingId={DETAILS_HEADING_ID}
      title="Where should we collect?"
      intro="The rider calls you when they reach the gate."
    >
      <div className="grid gap-4 rounded-3xl bg-card p-4 shadow-card sm:p-6">
        {remembered && (
          <p className="flex flex-wrap items-center justify-between gap-x-3 rounded-2xl bg-secondary/70 py-1 pr-1 pl-3.5 text-caption text-muted-foreground">
            Filled in from your last order on this phone.
            <button
              type="button"
              onClick={onForget}
              className="min-h-11 rounded-full px-3 font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Not you? Clear
            </button>
          </p>
        )}

        <div className="grid gap-4 @2xl:grid-cols-2">
          <div className="grid gap-3.5 @2xl:col-span-2">
            <FormField label="Pickup location">
              <Input
                {...input("location")}
                autoComplete="street-address"
                placeholder="Estate, street or landmark…"
              />
            </FormField>
            {error("location")}
          </div>
          <div className="grid content-start gap-3.5">
            <FormField label="Your name">
              <Input {...input("name")} autoComplete="name" placeholder="e.g. Jane Wanjiru…" />
            </FormField>
            {error("name")}
          </div>
          <div className="grid content-start gap-3.5">
            <FormField label="Phone number">
              <Input
                {...input("phone")}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="0712 345 678…"
                className="figures"
              />
            </FormField>
            {error("phone")}
          </div>
          <FormField
            label="Notes for us (optional)"
            hint="Stains, delicate items, or how to find your gate."
            className="@2xl:col-span-2"
          >
            <Textarea
              value={details.notes}
              onChange={(e) => onChange("notes", e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="e.g. White shirt has a coffee stain"
            />
          </FormField>
        </div>

        <div className="grid gap-2 border-t border-border pt-4">
          <p className="text-body-sm font-semibold">{NOTIFY_LABEL}</p>
          <ChoiceChips
            label={NOTIFY_LABEL}
            columns={3}
            options={notifyOptions.map((o) => ({
              value: o.id,
              // "Phone call" is too wide for a 3-up row on small phones.
              label:
                o.id === "call" ? (
                  <>
                    <span className="xs:hidden">Call</span>
                    <span className="hidden xs:inline">{o.label}</span>
                  </>
                ) : (
                  o.label
                ),
              srLabel: o.label,
              icon: notifyIcons[o.id],
            }))}
            value={notify}
            onChange={onNotifyChange}
            aria-describedby="notify-note"
            className="@md:max-w-md"
          />
          <p
            id="notify-note"
            aria-live="polite"
            className="flex items-start gap-2 text-caption text-muted-foreground"
          >
            <BellRing aria-hidden className="mt-px size-3.5 shrink-0 text-clay" />
            {notifyOption(notify).reassurance}
          </p>
        </div>
      </div>
    </StepSection>
  );
}
