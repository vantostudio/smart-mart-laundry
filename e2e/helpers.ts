import type { Locator } from "@playwright/test";

export type Viewport = { width: number; height: number; mobile: boolean };

/** `test.use()` options for a viewport; phone and tablet widths are touch devices. */
export const device = ({ width, height, mobile }: Viewport) => ({
  viewport: { width, height },
  isMobile: mobile,
  hasTouch: mobile,
});

export const phone = device({ width: 390, height: 844, mobile: true });

/** The message a WhatsApp link would send: its decoded href. */
export async function whatsappMessage(link: Locator) {
  return decodeURIComponent((await link.getAttribute("href")) ?? "");
}
