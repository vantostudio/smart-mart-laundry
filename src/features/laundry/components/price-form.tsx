"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/features/admin/components/form-field";
import { laundryMessages as m, settingsMessages } from "@/features/admin/messages";
import {
  amount,
  SaveRow,
  SettingsPanel,
  useSave,
} from "@/features/settings/components/settings-form";

import type { LaundryCategory, LaundryItem } from "../data";
import { saveLaundryPrices } from "../lib/items-client";

/**
 * One group's prices, saved together, with a way to edit or add items. Staff who aren't the owner
 * see the prices only.
 */
export function PriceForm({
  category,
  heading,
  note,
  items,
  canEdit,
}: {
  category: LaundryCategory;
  heading: string;
  note: string;
  items: LaundryItem[];
  canEdit: boolean;
}) {
  const initial = () => Object.fromEntries(items.map((i) => [i.id, String(i.price)]));
  const [values, setValues] = useState(initial);

  // Next.js keeps this page's state, so a price saved on an item's own page must replace what's here.
  const current = items.map((i) => `${i.id}=${i.price}`).join();
  const [shown, setShown] = useState(current);
  if (shown !== current) {
    setShown(current);
    setValues(initial());
  }

  const { saving, saved, failure, submit, form, edited } = useSave(() =>
    saveLaundryPrices(Object.fromEntries(items.map((i) => [i.id, amount(values[i.id] ?? "")]))),
  );
  const errorFor = (id: string) => (failure?.field === id ? failure.message : undefined);
  const fieldAtFault = items.some((i) => i.id === failure?.field);

  return (
    <SettingsPanel heading={heading} body={note}>
      <form ref={form} onSubmit={submit} onChange={edited} noValidate className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <FormField
              key={item.id}
              name={item.id}
              label={item.name}
              htmlFor={`price-${item.id}`}
              error={errorFor(item.id)}
            >
              <div className="flex gap-2">
                <Input
                  id={`price-${item.id}`}
                  inputMode="numeric"
                  disabled={!canEdit}
                  value={values[item.id] ?? ""}
                  onChange={(e) => setValues({ ...values, [item.id]: e.target.value })}
                  aria-invalid={errorFor(item.id) ? true : undefined}
                  aria-describedby={`price-${item.id}-help`}
                />
                {canEdit && (
                  <Button asChild variant="outline">
                    <Link
                      href={`/admin/laundry/${item.id}/edit`}
                      aria-label={m.editItem(item.name)}
                    >
                      {m.edit}
                    </Link>
                  </Button>
                )}
              </div>
            </FormField>
          ))}
        </div>
        {canEdit && (
          <>
            <SaveRow
              saving={saving}
              saved={saved}
              savedText={settingsMessages.savedForShop}
              general={failure && !fieldAtFault ? failure : null}
            />
            <div>
              <Button asChild variant="ghost" className="-ml-3">
                <Link href={`/admin/laundry/new?category=${category}`}>
                  <Plus aria-hidden /> {m.addItem(heading)}
                </Link>
              </Button>
            </div>
          </>
        )}
      </form>
    </SettingsPanel>
  );
}
