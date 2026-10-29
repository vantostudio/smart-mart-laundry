import { expect, test } from "@playwright/test";

import { phone } from "./helpers";

/* The home page: the hero's way into booking, and the reviews marquee (still with reduced motion). */

test.use(phone);

test("hero button opens the booking page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Book a pickup" }).first().click();
  await expect(page).toHaveURL(/\/laundry$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test.describe("reviews marquee", () => {
  test("moves", async ({ page }) => {
    await page.goto("/");
    const row = page.locator(".animate-marquee").first();
    await expect(row).toHaveCSS("animation-play-state", "running");
    const before = await row.evaluate((el) => el.getBoundingClientRect().x);
    await page.waitForTimeout(800);
    const after = await row.evaluate((el) => el.getBoundingClientRect().x);
    expect(after).not.toBe(before);
  });

  test.describe("with reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("stands still", async ({ page }) => {
      await page.goto("/");
      const row = page.locator(".animate-marquee").first();
      await page.waitForTimeout(300);
      const before = await row.evaluate((el) => el.getBoundingClientRect().x);
      await page.waitForTimeout(800);
      expect(await row.evaluate((el) => el.getBoundingClientRect().x)).toBe(before);
    });
  });
});
