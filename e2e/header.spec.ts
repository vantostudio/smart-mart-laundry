import { expect, test } from "@playwright/test";

import { device } from "./helpers";

/*
 * The header with both carts filled, the widest it gets. Phones and tablets: menu button, the full
 * logo centred, one orders button, no sideways scroll. The menu and the orders sheet lead on.
 */

const carts = {
  "streetmart-cart": [{ id: "basket-small", name: "Small basket", price: 150, qty: 2 }],
  "streetmart-bag": [{ id: "SM-1002:M", name: "Oversized hoodie", price: 1500, qty: 1, max: 8 }],
};

for (const width of [320, 360, 390, 430, 768]) {
  test.describe(`${width}px`, () => {
    test.use(device({ width, height: 800, mobile: true }));

    test.beforeEach(async ({ page }) => {
      await page.addInitScript((stored) => {
        for (const [key, value] of Object.entries(stored)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      }, carts);
      await page.goto("/about");
    });

    test("fits with the full logo centred and both carts filled", async ({ page }) => {
      const header = page.locator("header");
      await expect(header.getByRole("button", { name: "Your orders, 3 items" })).toBeVisible();
      await expect(header.getByRole("button", { name: "Open menu" })).toBeVisible();
      const logo = header.getByRole("link", { name: "Street Mart home" });
      await expect(logo.getByText("Street Mart")).toBeVisible();

      const box = (await logo.boundingBox())!;
      expect(Math.abs(box.x + box.width / 2 - width / 2)).toBeLessThan(4);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    });

    test("menu and orders lead to every page and cart", async ({ page }) => {
      await page.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("dialog", { name: "Menu" });
      await expect(menu.getByRole("link", { name: /About us/ })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await menu.getByRole("link", { name: /Shop clothes & shoes/ }).click();
      await expect(page).toHaveURL(/\/shop$/);
      await expect(menu).toBeHidden();

      await page.getByRole("button", { name: "Your orders, 3 items" }).click();
      await page
        .getByRole("dialog", { name: "Your orders" })
        .getByRole("link", { name: /Shop bag/ })
        .click();
      await expect(page.getByRole("dialog", { name: "Your bag" })).toBeVisible();
    });
  });
}
