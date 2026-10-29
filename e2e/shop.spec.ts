import { expect, test } from "@playwright/test";

/*
 * /shop: search, aisles and filters in the URL, the empty state's WhatsApp ask, the quick view
 * (size required, mtumba capped at one), and the bag through to the WhatsApp order.
 */

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

const count = (page: import("@playwright/test").Page) =>
  page.locator("#catalogue").getByText(/^\d+ items?$/);

test("search, aisle and condition narrow the catalogue and land in the URL", async ({ page }) => {
  await page.goto("/shop");
  await expect(count(page)).toHaveText(/^\d{2} items$/);

  await page.getByLabel("Search the shop").fill("denim");
  await expect(page).toHaveURL(/q=denim/);
  const cards = page.locator("#catalogue article");
  await expect(cards.first()).toBeVisible();
  // The grid catches up a moment after typing (deferred), so wait for it.
  await expect
    .poll(async () => (await cards.locator("h3").allTextContents()).every((n) => /denim/i.test(n)))
    .toBe(true);

  await page.getByRole("button", { name: "Men wear" }).click();
  await page.getByRole("radio", { name: "Mtumba" }).click();
  await expect(page).toHaveURL(/q=denim&cat=men&cond=mtumba/);
  await expect(page.getByRole("button", { name: "Remove filter Men wear" })).toBeVisible();

  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test("an empty search offers to find it on WhatsApp", async ({ page }) => {
  await page.goto("/shop?q=tuxedo");
  await expect(page.getByText("Nothing matches “tuxedo”")).toBeVisible();
  const ask = page.getByRole("link", { name: "Ask us to find it" });
  expect(decodeURIComponent((await ask.getAttribute("href")) ?? "")).toContain(
    "I'm looking for tuxedo",
  );
});

test("filters sheet narrows by size and price", async ({ page }) => {
  await page.goto("/shop?cat=shoes");
  await page.getByRole("button", { name: /Filters/ }).click();
  await page.getByRole("button", { name: "42", exact: true }).click();
  await page.getByRole("button", { name: "Over KSh 2,000" }).click();
  await page.getByRole("button", { name: /^Show \d+ items?$/ }).click();
  await expect(page).toHaveURL(/cat=shoes&size=42&price=2000-plus/);
  for (const price of await page
    .locator("#catalogue article")
    .getByText(/^KSh/)
    .allTextContents()) {
    expect(Number(price.replace(/\D/g, ""))).toBeGreaterThan(2000);
  }
});

test("quick view needs a size, then the bag sends one WhatsApp order", async ({ page }) => {
  await page.goto("/shop?item=SM-1002");
  const sheet = page.getByRole("dialog", { name: "Oversized hoodie" });
  await expect(sheet).toBeVisible();

  await sheet.getByRole("button", { name: /Add to bag/ }).click();
  await expect(sheet.getByText("Choose a size first.")).toBeVisible();
  await sheet.getByRole("radio", { name: "L", exact: true }).click();
  await sheet.getByRole("button", { name: /Add to bag/ }).click();
  await sheet.getByRole("button", { name: "View bag" }).click();

  const bag = page.getByRole("dialog", { name: "Your bag" });
  await expect(bag.getByText("SM-1002 · Size L")).toBeVisible();
  await expect(bag.getByText("Free delivery unlocked.")).toBeVisible();

  await bag.getByRole("radio", { name: /Pick up in store/ }).click();
  await expect(bag.getByLabel("Delivery location")).toHaveCount(0);
  await bag.getByLabel("Your name").fill("Wanjiru");
  await bag.getByLabel("Phone number").fill("0712345678");
  await expect(bag.getByText("All set. Send it when you're ready.")).toBeVisible();

  const send = bag.getByRole("link", { name: "Send order on WhatsApp" });
  const href = decodeURIComponent((await send.getAttribute("href")) ?? "");
  expect(href).toContain("1 × Oversized hoodie (SM-1002 · Size L) — KSh 1,500");
  expect(href).toContain("Pick up in store");
  expect(href).toContain("Total: KSh 1,500");
});

test("a mtumba piece adds from the card and stays at one", async ({ page }) => {
  await page.goto("/shop?q=sm-1204");
  await page.getByRole("button", { name: "Add 501 jeans" }).click();
  // Added straight away (one size), so the bar shows the delivery nudge.
  await expect(page.getByText("KSh 600 to free delivery")).toBeVisible();

  await page.getByRole("button", { name: "View bag" }).click();
  const bag = page.getByRole("dialog", { name: "Your bag" });
  await expect(bag.getByText("Add KSh 600 more for free delivery.")).toBeVisible();
  await expect(bag.getByRole("button", { name: "Add one 501 jeans" })).toBeDisabled();
});
