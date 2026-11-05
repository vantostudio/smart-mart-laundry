"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import type { ShopSettings } from "@/config/shop-settings";
import { FormField } from "@/features/admin/components/form-field";
import { settingsMessages as m } from "@/features/admin/messages";

import { saveShopSettings } from "../lib/settings-client";
import { SaveRow, SettingsPanel, useSave } from "./settings-form";

/** An empty box is NaN, which JSON sends as null and the API names as the field to fix. */
const amount = (value: string) => (value.trim() === "" ? Number.NaN : Number(value));

const FIELDS = ["deliveryFee", "deliveryFreeFrom"];

export function DeliveryForm({ settings }: { settings: ShopSettings }) {
  const [fee, setFee] = useState(String(settings.deliveryFee));
  const [freeFrom, setFreeFrom] = useState(String(settings.deliveryFreeFrom));
  const { saving, saved, failure, submit } = useSave(() =>
    saveShopSettings({ deliveryFee: amount(fee), deliveryFreeFrom: amount(freeFrom) }),
  );
  const errorFor = (field: string) => (failure?.field === field ? failure.message : undefined);

  return (
    <SettingsPanel heading={m.deliveryHeading} body={m.deliveryBody}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            name="deliveryFee"
            label={m.deliveryFee}
            htmlFor="delivery-fee"
            error={errorFor("deliveryFee")}
          >
            <Input
              id="delivery-fee"
              inputMode="numeric"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              aria-invalid={errorFor("deliveryFee") ? true : undefined}
              aria-describedby="delivery-fee-help"
            />
          </FormField>
          <FormField
            name="deliveryFreeFrom"
            label={m.deliveryFreeFrom}
            htmlFor="delivery-free-from"
            hint={m.deliveryFreeFromHint}
            error={errorFor("deliveryFreeFrom")}
          >
            <Input
              id="delivery-free-from"
              inputMode="numeric"
              value={freeFrom}
              onChange={(e) => setFreeFrom(e.target.value)}
              aria-invalid={errorFor("deliveryFreeFrom") ? true : undefined}
              aria-describedby="delivery-free-from-help"
            />
          </FormField>
        </div>
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
