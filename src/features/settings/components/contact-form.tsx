"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { longTime, phoneDisplay, type ShopSettings } from "@/config/shop-settings";
import { FormField } from "@/features/admin/components/form-field";
import { settingsMessages as m } from "@/features/admin/messages";

import { saveShopSettings } from "../lib/settings-client";
import { SaveRow, SettingsPanel, useSave } from "./settings-form";

type HourField = "weekOpen" | "weekClose" | "sundayOpen" | "sundayClose";

const hourFields: { field: HourField; label: string }[] = [
  { field: "weekOpen", label: m.weekOpen },
  { field: "weekClose", label: m.weekClose },
  { field: "sundayOpen", label: m.sundayOpen },
  { field: "sundayClose", label: m.sundayClose },
];

const hours = Array.from({ length: 25 }, (_, hour) => hour);

const FIELDS = ["phone", ...hourFields.map((h) => h.field)];

export function ContactForm({ settings }: { settings: ShopSettings }) {
  const [phone, setPhone] = useState(phoneDisplay(settings.phone));
  const [times, setTimes] = useState({
    weekOpen: settings.weekOpen,
    weekClose: settings.weekClose,
    sundayOpen: settings.sundayOpen,
    sundayClose: settings.sundayClose,
  });
  const { saving, saved, failure, submit } = useSave(() => saveShopSettings({ phone, ...times }));

  const phoneError = failure?.field === "phone" ? m.phoneInvalid : undefined;
  const hourError = (field: HourField) =>
    failure?.field === field ? m.closesAfterOpens : undefined;

  return (
    <SettingsPanel heading={m.contactHeading} body={m.contactBody}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <FormField
          name="phone"
          label={m.phone}
          htmlFor="shop-phone"
          hint={m.phoneHint}
          error={phoneError}
        >
          <Input
            id="shop-phone"
            type="tel"
            value={phone}
            maxLength={30}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby="shop-phone-help"
          />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          {hourFields.map(({ field, label }) => (
            <FormField
              key={field}
              name={field}
              label={label}
              htmlFor={`hours-${field}`}
              error={hourError(field)}
            >
              <NativeSelect
                id={`hours-${field}`}
                value={times[field]}
                onChange={(e) => setTimes({ ...times, [field]: Number(e.target.value) })}
                aria-invalid={hourError(field) ? true : undefined}
                aria-describedby={`hours-${field}-help`}
              >
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {longTime(hour)}
                  </option>
                ))}
              </NativeSelect>
            </FormField>
          ))}
        </div>
        <p className="text-caption text-muted-foreground">{m.contactSearchNote}</p>
        <SaveRow
          saving={saving}
          saved={saved}
          savedText={m.savedForShop}
          general={failure && !FIELDS.includes(failure.field ?? "") ? failure : null}
        />
      </form>
    </SettingsPanel>
  );
}
