import { expect, type Locator, type Page } from "@playwright/test";

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

/**
 * Add a laundry item by tapping its card. A tap that lands before the page has hydrated does
 * nothing, so keep tapping until the card turns into a stepper (it can't add twice: the "Add"
 * button is gone once the item is in the cart).
 */
export async function addLaundryItem(page: Page, name: string) {
  await expect(async () => {
    const add = page.getByRole("button", { name: `Add ${name}` });
    if (await add.isVisible()) await add.click();
    await expect(page.getByRole("button", { name: `Add one ${name}` })).toBeVisible({
      timeout: 1_000,
    });
  }).toPass();
}
