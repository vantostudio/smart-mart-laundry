/**
 * The customer's contact details, kept on their own phone (localStorage) after they send an
 * order, so the next order is a couple of taps. Nothing leaves the browser.
 */
export type SavedDetails = { location: string; name: string; phone: string };

export const SAVED_DETAILS_KEY = "streetmart-details";

export function readSavedDetails(): SavedDetails | null {
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

export function writeSavedDetails(details: SavedDetails) {
  try {
    localStorage.setItem(SAVED_DETAILS_KEY, JSON.stringify(details));
  } catch {
    // storage unavailable: nothing to remember
  }
}

export function clearSavedDetails() {
  try {
    localStorage.removeItem(SAVED_DETAILS_KEY);
  } catch {
    // storage unavailable
  }
}
