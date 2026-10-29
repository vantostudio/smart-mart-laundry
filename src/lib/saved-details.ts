import { useEffect, useState } from "react";

/**
 * The customer's contact details, kept on their own phone (localStorage) after they send an
 * order, so the next order is a couple of taps. Nothing leaves the browser.
 */
type SavedDetails = { location: string; name: string; phone: string };

/** An order form's contact fields: the saved details plus notes, which are never saved. */
export type ContactDetails = SavedDetails & { notes: string };

export const SAVED_DETAILS_KEY = "streetmart-details";

const emptyDetails: ContactDetails = { location: "", name: "", phone: "", notes: "" };

function readSavedDetails(): SavedDetails | null {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SAVED_DETAILS_KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return null;
    const { location, name, phone } = parsed as Record<string, unknown>;
    if (typeof location !== "string" || typeof name !== "string" || typeof phone !== "string") {
      return null;
    }
    return { location, name, phone };
  } catch {
    return null;
  }
}

function writeSavedDetails(details: SavedDetails) {
  try {
    localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify(details));
  } catch {
    // storage unavailable: nothing to remember
  }
}

function clearSavedDetails() {
  try {
    localStorage.removeItem(SAVED_DETAILS_KEY);
  } catch {
    // storage unavailable
  }
}

/**
 * Contact fields for an order form, filled in from this phone's saved details after hydration
 * (`remembered`). `remember` saves them once an order is sent; `forget` clears them, keeping notes.
 */
export function useContactDetails() {
  const [details, setDetails] = useState<ContactDetails>(emptyDetails);
  const [remembered, setRemembered] = useState(false);

  useEffect(() => {
    // Saved details live in localStorage, which only exists after hydration.
    const saved = readSavedDetails();
    if (!saved) return;
    // oxlint-disable-next-line react/set-state-in-effect
    setDetails((d) => ({ ...d, ...saved }));
    setRemembered(true);
  }, []);

  function setField(field: keyof ContactDetails, value: string) {
    setDetails((d) => ({ ...d, [field]: value }));
  }

  function remember() {
    writeSavedDetails({ location: details.location, name: details.name, phone: details.phone });
  }

  function forget() {
    clearSavedDetails();
    setDetails((d) => ({ ...emptyDetails, notes: d.notes }));
    setRemembered(false);
  }

  return { details, remembered, setField, remember, forget };
}
