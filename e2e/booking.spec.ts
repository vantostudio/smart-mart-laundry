import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test("hero button opens the booking page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Book a pickup" }).first().click();
  await expect(page).toHaveURL(/\/laundry$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("an order placed on the page carries the time, notes and notify choice", async ({ page }) => {
  await page.goto("/laundry");

  // Tap the first open time: it applies straight away and lands in the URL.
  const times = page.getByRole("radiogroup", { name: "Pickup time" });
  await times.getByRole("radio").first().click();
  await expect(page).toHaveURL(/pickup=\d{4}-\d{2}-\d{2}&window=\w+&return=next-day/);

  await page.getByRole("button", { name: "Add Small basket" }).click();
  await page.getByLabel(/Pickup location/i).fill("Ndagani, blue gate");
  await page.getByLabel(/Your name/i).fill("Wanjiru");
  await page.getByLabel(/Phone number/i).fill("0712345678");
  await page.getByLabel(/Notes for us/i).fill("Coffee stain on the white shirt");
  await page.getByRole("radio", { name: /SMS/ }).click();
  await expect(page.getByText("Still needed")).toHaveCount(0);

  const send = page.getByRole("link", { name: /Send order on WhatsApp/i });
  const href = decodeURIComponent((await send.getAttribute("href")) ?? "");
  expect(href).toContain("1 × Small basket");
  expect(href).toContain("Notify me by: SMS");
  expect(href).toContain("Notes: Coffee stain on the white shirt");
  expect(href).toContain("Ndagani, blue gate");
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

  test("stands still with reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const row = page.locator(".animate-marquee").first();
    await page.waitForTimeout(300);
    const before = await row.evaluate((el) => el.getBoundingClientRect().x);
    await page.waitForTimeout(800);
    expect(await row.evaluate((el) => el.getBoundingClientRect().x)).toBe(before);
    await context.close();
  });
});
