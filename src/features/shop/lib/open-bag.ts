/** Fired by the header bag button while on /shop, so the bag opens without a navigation. */
export const OPEN_BAG_EVENT = "streetmart:open-bag";

/** Hash that opens the bag when /shop loads (the header links here from other pages). */
export const BAG_HASH = "#bag";

export function openBag() {
  window.dispatchEvent(new Event(OPEN_BAG_EVENT));
}
