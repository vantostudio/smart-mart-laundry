import { z } from "zod";

/* What the settings API accepts. Strict: unknown fields are refused. */

const MAX_KSH = 1_000_000;

const ksh = z.number().int().min(0).max(MAX_KSH);
const hour = z.number().int().min(0).max(24);

/** "0113 154 708" and "+254 113 154 708" both become "254113154708". */
function normalisePhone(raw: string): string {
  const digits = raw.replace(/[\s()+-]/g, "");
  return digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
}

const phone = z
  .string()
  .max(30)
  .transform(normalisePhone)
  .pipe(z.string().regex(/^254[17]\d{8}$/));

/** Both ends of a day together, closing after opening, so a saved row always makes sense. */
const opensBeforeCloses = (open: number | undefined, close: number | undefined) =>
  open === undefined ? close === undefined : close !== undefined && open < close;

/** A change to any of the settings. Each form sends only its own part. */
export const updateShopSettingsInput = z
  .object({
    deliveryFee: ksh,
    deliveryFreeFrom: ksh,
    phone,
    weekOpen: hour,
    weekClose: hour,
    sundayOpen: hour,
    sundayClose: hour,
  })
  .partial()
  .strict()
  .refine((patch) => Object.keys(patch).length > 0)
  .refine((p) => opensBeforeCloses(p.weekOpen, p.weekClose), { path: ["weekClose"] })
  .refine((p) => opensBeforeCloses(p.sundayOpen, p.sundayClose), { path: ["sundayClose"] });

export type UpdateShopSettingsInput = z.output<typeof updateShopSettingsInput>;
