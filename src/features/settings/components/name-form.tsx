"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { FormField } from "@/features/admin/components/form-field";
import { settingsMessages as m } from "@/features/admin/messages";

import { saveOwnName } from "../lib/settings-client";
import { SaveRow, SettingsPanel, useSave } from "./settings-form";

/** Everyone's own display name, so the admin never needs to show an email. */
export function NameForm({ name: initial }: { name: string | null }) {
  const [name, setName] = useState(initial ?? "");
  const { saving, saved, failure, submit } = useSave(() => saveOwnName(name));
  const error = failure?.field === "name" ? failure.message : undefined;

  return (
    <SettingsPanel heading={m.yourNameHeading} body={m.yourNameBody}>
      <form onSubmit={submit} noValidate className="grid gap-4">
        <FormField name="name" label={m.yourNameLabel} htmlFor="own-name" error={error}>
          <Input
            id="own-name"
            value={name}
            maxLength={80}
            autoComplete="name"
            onChange={(e) => setName(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby="own-name-help"
          />
        </FormField>
        <SaveRow
          saving={saving}
          saved={saved}
          savedText={m.saved}
          general={failure?.field === "name" ? null : failure}
        />
      </form>
    </SettingsPanel>
  );
}
