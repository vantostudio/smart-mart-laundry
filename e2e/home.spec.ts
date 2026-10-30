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

test("the shop is one tap or one swipe from the top", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Shop clothes", exact: true }).click();
  await expect(page).toHaveURL(/\/shop$/);

  await page.goto("/");
  // The rail starts within the first screen and a half on a phone, not at the end of the page.
  const rail = page.getByRole("region", { name: "New at the shop" });
  const top = await rail.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  expect(top).toBeLessThan(844 * 1.5);

  // A card opens that item's quick view.
  await rail.getByRole("listitem").first().getByRole("link").click();
  await expect(page).toHaveURL(/\/shop\?item=SM-\d+/);
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("how booking works sits in 'Everything taken care of'", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Laundry doesn't have to be complicated")).toHaveCount(0);
  const services = page.locator("#services");
  const steps = services.getByRole("list", { name: "How booking works" }).getByRole("listitem");
  await expect(steps).toHaveText([
    "1Tap what needs washing",
    "2Pick your days",
    "3Send it on WhatsApp",
  ]);
  await services.getByRole("link", { name: "Book a pickup" }).click();
  await expect(page).toHaveURL(/\/laundry$/);
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
