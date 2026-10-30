import { expect, test } from "@playwright/test";

import { phone } from "./helpers";

/* The home page: the hero's way into booking, and motion that runs on every device. */

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
});

// Phones with "Reduce motion" / "Remove animations" (often turned on by battery saver) still move.
test.describe("on a phone set to reduce motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("the reviews still drift", async ({ page }) => {
    await page.goto("/");
    const row = page.locator(".animate-marquee").first();
    const before = await row.evaluate((el) => el.getBoundingClientRect().x);
    await page.waitForTimeout(800);
    expect(await row.evaluate((el) => el.getBoundingClientRect().x)).not.toBe(before);
  });

  test("the hero order updates still cycle", async ({ page }) => {
    await page.goto("/");
    const newest = page.locator("ul[aria-hidden] li").first();
    const first = await newest.textContent();
    await expect.poll(() => newest.textContent(), { timeout: 8_000 }).not.toBe(first);
  });
});

test("the reviews can be swiped by hand, and hold still while you do", async ({ page }) => {
  await page.goto("/");
  const row = page.locator(".animate-marquee").first().locator("..");
  const track = row.locator(".animate-marquee").first();
  // Starts one copy in, so there's room to swipe either way.
  const start = await row.evaluate((el) => el.scrollLeft);
  expect(start).toBeGreaterThan(0);

  await row.evaluate((el) => el.scrollBy({ left: 300 }));
  await expect.poll(() => row.evaluate((el) => el.scrollLeft)).toBeGreaterThan(start);
  await expect(track).toHaveCSS("animation-play-state", "paused");
  // Left alone, it drifts again.
  await expect(track).toHaveCSS("animation-play-state", "running", { timeout: 6_000 });
});
