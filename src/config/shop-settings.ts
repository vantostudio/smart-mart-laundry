import { formatTime, type OpeningHours } from "@/lib/opening-hours";

/*
 * What staff can change in the admin. Public pages start from these defaults and swap in the saved
 * values once `/api/settings` answers, so a failed request never breaks a page. Safe for client code.
 */

export type ShopSettings = {
  /** Whole KSh, charged when a bag is under `deliveryFreeFrom`. */
  deliveryFee: number;
  deliveryFreeFrom: number;
  /** Digits only ("254113154708"), for both calls and WhatsApp. */
  phone: string;
  /** Whole hours on a 24 hour clock, in shop time. */
  weekOpen: number;
  weekClose: number;
  sundayOpen: number;
  sundayClose: number;
};

export const defaultShopSettings: ShopSettings = {
  deliveryFee: 100,
  deliveryFreeFrom: 1500,
  phone: "254113154708",
  weekOpen: 7,
  weekClose: 20,
  sundayOpen: 9,
  sundayClose: 16,
};

/** "254113154708" → "+254 113 154 708". */
export const phoneDisplay = (phone: string) =>
  `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;

export const phoneHref = (phone: string) => `tel:+${phone}`;

const clock = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

export function openingHoursOf(s: ShopSettings): OpeningHours {
  return [
    { days: [1, 2, 3, 4, 5, 6], open: clock(s.weekOpen), close: clock(s.weekClose) },
    { days: [0], open: clock(s.sundayOpen), close: clock(s.sundayClose) },
  ];
}

/** 7 → "7:00 AM". */
const longTime = (hour: number) => formatTime(clock(hour)).replace(" ", ":00 ");

/** Opening hours as people read them. */
export function hoursRows(s: ShopSettings) {
  return [
    { days: "Monday – Saturday", time: `${longTime(s.weekOpen)} – ${longTime(s.weekClose)}` },
    { days: "Sunday", time: `${longTime(s.sundayOpen)} – ${longTime(s.sundayClose)}` },
  ];
}
