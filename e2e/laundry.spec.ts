import { expect, test, type Page } from "@playwright/test";

import { priceGroups } from "../src/features/laundry/data";
import { addLaundryItem, device, phone, whatsappMessage } from "./helpers";

/*
 * /laundry: the "Good to know" bento (every price listed, tiles never overlap, no two side-by-side
 * tiles share a top edge), the booking chips, and the order ticket from empty through to the
 * WhatsApp message.
 */

type Box = { x: number; y: number; width: number; height: number };

async function tiles(page: Page): Promise<Box[]> {
  const prices = page.locator("#prices");
  await prices.scrollIntoViewIfNeeded();
  return prices.locator("article").evaluateAll((els) =>
    els.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
    }),
  );
}

const overlap = (a: Box, b: Box) =>
  a.x < b.x + b.width - 1 &&
  b.x < a.x + a.width - 1 &&
  a.y < b.y + b.height - 1 &&
  b.y < a.y + a.height - 1;

const besideEachOther = (a: Box, b: Box) => a.x + a.width <= b.x || b.x + b.width <= a.x;

for (const vp of [
  { width: 360, height: 740, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1280, height: 800, mobile: false },
]) {
  test.describe(`good to know at ${vp.width}px`, () => {
    test.use(device(vp));

    test("lists every price in a staggered bento", async ({ page }) => {
      await page.goto("/laundry");
      const prices = page.locator("#prices");
      for (const g of priceGroups) {
        await expect(prices.getByRole("heading", { name: g.title })).toBeVisible();
        for (const item of g.items) {
          await expect(prices.getByText(item.label, { exact: true }).first()).toBeAttached();
        }
      }

      const boxes = await tiles(page);
      expect(boxes.length).toBeGreaterThanOrEqual(8);
      const pairs = boxes.flatMap((a, i) => boxes.slice(i + 1).map((b) => [a, b] as const));
      for (const [a, b] of pairs) expect(overlap(a, b)).toBe(false);

      // Tiles side by side never start on the same line.
      const sideBySide = pairs.filter(([a, b]) => besideEachOther(a, b));
      if (vp.width >= 640) expect(sideBySide.length).toBeGreaterThan(0);
      expect(sideBySide.filter(([a, b]) => Math.abs(a.y - b.y) < 4)).toEqual([]);

      await expect(prices.getByRole("link", { name: /Call/ })).toHaveAttribute("href", /^tel:/);
      await expect(prices.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
        "href",
        /wa\.me|whatsapp/,
      );
    });
  });
}

test.describe("booking", () => {
  test.use(phone);

  test("tap pictures, pick two days and an area, send on WhatsApp: no typing", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/laundry");

    // Every item card shows a real photo that has loaded.
    const cardPhotos = page.locator("main ul li img");
    await expect(cardPhotos).toHaveCount(16);
    await expect
      .poll(() => cardPhotos.first().evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);

    // A category narrows the grid and lands in the URL.
    await page.getByRole("button", { name: "Carpets", exact: true }).click();
    await expect(page).toHaveURL(/cat=carpets/);
    await expect(page.getByRole("heading", { name: "Baskets" })).toHaveCount(0);
    await addLaundryItem(page, "Medium carpet");
    await page.getByRole("button", { name: "All", exact: true }).click();
    await addLaundryItem(page, "Small basket");
    await page.getByRole("button", { name: "Add one Small basket" }).click();

    await page
      .getByRole("button", { name: /Book pickup/ })
      .last()
      .click();
    const sheet = page.getByRole("dialog", { name: "Book pickup" });
    await expect(sheet.getByText("Medium carpet")).toBeVisible();

    // The button says what's next until everything is picked.
    await expect(sheet.getByRole("button", { name: /Pick a collection day/ })).toBeVisible();
    const open = sheet.locator("button[data-day]:not([disabled])");
    await open.nth(1).click();
    // Collection picked: the return is suggested as the next day.
    await expect(sheet.getByRole("radio", { name: /Return/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await expect(sheet.locator("button[data-day][aria-pressed=true]")).toHaveCount(2);
    await expect(page).toHaveURL(/pickup=\d{4}-\d{2}-\d{2}&back=\d{4}-\d{2}-\d{2}/);
    await expect(sheet.getByRole("button", { name: /Choose your area/ })).toBeVisible();

    await sheet.getByRole("radio", { name: "Ndagani" }).click();
    const message = await whatsappMessage(
      sheet.getByRole("link", { name: /Send order on WhatsApp/ }),
    );
    expect(message).toContain("2 × Small basket — KSh 300");
    expect(message).toContain("1 × Medium carpet — KSh 700");
    expect(message).toMatch(/Collection: \w{3} \d+ \w{3}/);
    expect(message).toMatch(/Return: \w{3} \d+ \w{3}/);
    expect(message).toContain("Area: Ndagani");
    expect(message).not.toMatch(/Name:|Phone:/);
    // Nothing had to be typed: the sheet has no text fields until a note is asked for.
    await expect(sheet.locator("input, textarea")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("a same-day return asks for a morning collection", async ({ page }) => {
    await page.goto("/laundry");
    await addLaundryItem(page, "Door mat");
    await page
      .getByRole("button", { name: /Book pickup/ })
      .last()
      .click();
    const sheet = page.getByRole("dialog", { name: "Book pickup" });
    const open = sheet.locator("button[data-day]:not([disabled])");
    await open.nth(1).click();
    // Wait for the return calendar (collection and suggested return both marked), then return on
    // the collection day itself.
    const chosen = sheet.locator("button[data-day][aria-pressed=true]");
    await expect(chosen).toHaveCount(2);
    await expect(sheet.getByRole("radio", { name: /Return/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    await chosen.first().click();
    await expect(sheet.getByText(/Same day needs a morning collection/)).toBeVisible();
  });
});
