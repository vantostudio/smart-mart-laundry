import { expect, test, type Page } from "@playwright/test";

import { priceGroups } from "../src/features/laundry/data";

/*
 * /laundry's "Good to know" bento: every price listed, tiles never overlap, and no two tiles share
 * a top edge (the stacks and pairs are deliberately offset). Plus the order ticket's progress
 * meter, from empty to "All set".
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

for (const vp of [
  { width: 360, height: 740, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1280, height: 800, mobile: false },
]) {
  test.describe(`good to know at ${vp.width}px`, () => {
    test.use({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
      hasTouch: vp.mobile,
    });

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
      for (const [i, a] of boxes.entries()) {
        for (const b of boxes.slice(i + 1)) expect(overlap(a, b)).toBe(false);
      }

      // Tiles side by side never start on the same line.
      const sideBySide = boxes.flatMap((a, i) =>
        boxes.slice(i + 1).filter((b) => a.x + a.width <= b.x || b.x + b.width <= a.x),
      );
      const rows = boxes.flatMap((a, i) =>
        boxes
          .slice(i + 1)
          .filter((b) => (a.x + a.width <= b.x || b.x + b.width <= a.x) && Math.abs(a.y - b.y) < 4),
      );
      if (vp.width >= 640) expect(sideBySide.length).toBeGreaterThan(0);
      expect(rows).toEqual([]);

      await expect(prices.getByRole("link", { name: /Call/ })).toHaveAttribute("href", /^tel:/);
      await expect(prices.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
        "href",
        /wa\.me|whatsapp/,
      );
    });
  });
}

test.describe("order ticket", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("counts what's done and turns ready when complete", async ({ page }) => {
    await page.goto("/laundry");
    const ticket = page.locator("#cart");
    await expect(ticket.getByText("0 of 5 done")).toBeVisible();
    await expect(ticket.getByText(/Nothing added yet/)).toBeVisible();

    await page.getByRole("radiogroup", { name: "Pickup time" }).getByRole("radio").first().click();
    await page.getByRole("button", { name: "Add Medium basket" }).click();
    await expect(ticket.getByText("2 of 5 done")).toBeVisible();
    await expect(ticket.getByText("1 × Medium basket")).toBeVisible();
    await expect(ticket.getByText("Not chosen")).toHaveCount(0);

    // The checklist jumps to the field it names.
    await ticket.getByRole("button", { name: /where to collect/ }).click();
    await expect(page.getByLabel(/Pickup location/i)).toBeFocused();
    await page.getByLabel(/Pickup location/i).fill("Ndagani");
    await page.getByLabel(/Your name/i).fill("Wanjiru");
    await page.getByLabel(/Phone number/i).fill("0712345678");

    await expect(ticket.getByText("All set. Send it when you're ready.")).toBeVisible();
    await expect(ticket.getByText("Still needed")).toHaveCount(0);
  });
});

test.describe("booking controls", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("the page comes alive and day, time and return chips select", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/laundry");

    // The skeleton gives way to the real choices once the page hydrates.
    const days = page.getByRole("radiogroup", { name: "Pickup day" });
    await expect(days).toBeVisible();

    const tomorrow = days.getByRole("radio").nth(1);
    await tomorrow.click();
    await expect(tomorrow).toHaveAttribute("aria-checked", "true");

    const time = page.getByRole("radiogroup", { name: "Pickup time" }).getByRole("radio").first();
    await time.click();
    await expect(time).toHaveAttribute("aria-checked", "true");

    const twoDays = page.getByRole("radiogroup", { name: "Back by" }).getByRole("radio", {
      name: /2 days/,
    });
    await twoDays.click();
    await expect(twoDays).toHaveAttribute("aria-checked", "true");
    await expect(page).toHaveURL(/return=two-days/);

    expect(errors).toEqual([]);
  });
});
