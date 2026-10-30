import { useEffect, useState } from "react";

/*
 * Where the customer wants pickup or delivery, remembered on their own phone (localStorage) after
 * they send an order, so the next order is preselected. The WhatsApp message itself carries their
 * name and number, so nothing else needs asking. Nothing leaves the browser.
 */

export const SAVED_AREA_KEY = "streetmart-area";

function readArea(areas: readonly string[]): string | null {
  try {
    const saved = localStorage.getItem(SAVED_AREA_KEY);
    return saved && areas.includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

/**
 * The area choice plus an optional note (hostel, gate) for an order. The area is restored from
 * this phone after hydration; `remember` saves it once an order is sent. Notes are never saved.
 */
export function useOrderPlace(areas: readonly string[]) {
  const [area, setArea] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    // localStorage only exists after hydration.
    const saved = readArea(areas);
    // oxlint-disable-next-line react/set-state-in-effect
    if (saved) setArea(saved);
  }, [areas]);

  function remember() {
    if (!area) return;
    try {
      localStorage.setItem(SAVED_AREA_KEY, area);
    } catch {
      // storage unavailable: nothing to remember
    }
  }

  return { area, setArea, note, setNote, remember };
}
