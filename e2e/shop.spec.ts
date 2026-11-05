import { expect, test, type Page } from "@playwright/test";

import { mockShopApi, phone, shopProducts, whatsappMessage } from "./helpers";

/*
 * /shop: search, aisles and filters in the URL, the empty state's WhatsApp ask, the quick view
 * (size required, last piece capped at one), and the bag through to the WhatsApp order. The API is
 * mocked, because browser tests run with no database; `src/app/api/products` has its own tests.
 */

test.use(phone);

test.beforeEach(({ page }) => mockShopApi(page));

const count = (page: Page) => page.locator("#catalogue").getByText(/^\d+ items?$/);

test("search, aisle and condition narrow the catalogue and land in the URL", async ({ page }) => {
  await page.goto("/shop");
  await expect(count(page)).toHaveText(/^\d{2} items$/);

  // Typing before hydration is wiped by the controlled input, so type again until it lands.
  await expect(async () => {
    await page.getByLabel("Search the shop").fill("denim");
    await expect(page).toHaveURL(/q=denim/, { timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
  const cards = page.locator("#catalogue article");
  await expect(cards.first()).toBeVisible();
  // The grid catches up a moment after typing, so wait for it.
  await expect
    .poll(async () => (await cards.locator("h3").allTextContents()).every((n) => /denim/i.test(n)))
    .toBe(true);

  await page.getByRole("button", { name: "Men's wear" }).click();
  await page.getByRole("radio", { name: "Mtumba" }).click();
  await expect(page).toHaveURL(/q=denim&cat=men&cond=mtumba/);
  await expect(page.getByRole("button", { name: "Remove filter Men's wear" })).toBeVisible();

  await page.getByRole("button", { name: "Clear all" }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test("an empty search offers to find it on WhatsApp", async ({ page }) => {
  await page.goto("/shop?q=tuxedo");
  await expect(page.getByText("Nothing matches “tuxedo”")).toBeVisible();
  const ask = page.getByRole("link", { name: "Ask us to find it" });
  expect(await whatsappMessage(ask)).toContain("I'm looking for tuxedo");
});

test("filters sheet narrows by size and price", async ({ page }) => {
  await page.goto("/shop?cat=shoes");
  // A tap before hydration doesn't open the sheet, so tap until it shows. Before tapping again,
  // give a late-opening sheet a moment: once it's open, its overlay covers Filters, so the tap
  // can't land and would keep retrying.
  const sheet = page.getByRole("dialog", { name: "Filters" });
  let tapped = false;
  await expect(async () => {
    const open =
      tapped &&
      (await sheet.waitFor({ timeout: 1_000 }).then(
        () => true,
        () => false,
      ));
    if (!open) await page.getByRole("button", { name: /Filters/ }).click();
    tapped = true;
    await expect(sheet).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
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

  // Delivery needs an area: the button says so, and three taps-not-typing buttons answer it.
  await expect(bag.getByRole("button", { name: /Choose your area/ })).toBeVisible();
  await bag.getByRole("radio", { name: "Chuka University" }).click();
  let message = await whatsappMessage(bag.getByRole("link", { name: "Send order on WhatsApp" }));
  expect(message).toContain("1 × Oversized hoodie (SM-1002 · Size L) — KSh 1,500");
  expect(message).toContain("Area: Chuka University");
  expect(message).not.toMatch(/Name:|Phone:/);

  // Pick up in store needs no area at all.
  await bag.getByRole("radio", { name: /Pick up in store/ }).click();
  await expect(bag.getByRole("radiogroup", { name: "Your area" })).toHaveCount(0);
  message = await whatsappMessage(bag.getByRole("link", { name: "Send order on WhatsApp" }));
  expect(message).toContain("Pick up in store");
  expect(message).toContain("Total: KSh 1,500");
  await expect(bag.locator("input, textarea")).toHaveCount(0);
});

test("the last piece adds from the card and stays at one", async ({ page }) => {
  await page.goto("/shop?q=sm-1204");
  // A tap before hydration is lost; tap only while "Add" shows, so it can't add twice.
  await expect(async () => {
    const add = page.getByRole("button", { name: "Add 501 jeans" });
    if (await add.isVisible()) await add.click();
    await expect(
      page.getByRole("button", { name: "501 jeans is in your bag, add another size" }),
    ).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });
  // Added straight away (one size), so the bar shows the delivery nudge.
  await expect(page.getByText("KSh 600 to free delivery")).toBeVisible();

  await page.getByRole("button", { name: "View bag" }).click();
  const bag = page.getByRole("dialog", { name: "Your bag" });
  await expect(bag.getByText("Add KSh 600 more for free delivery.")).toBeVisible();
  await expect(bag.getByRole("button", { name: "Add one 501 jeans" })).toBeDisabled();
});

test("Show more adds the next page and counts down", async ({ page }) => {
  await page.goto("/shop");
  const cards = page.locator("#catalogue article");
  await expect(count(page)).toHaveText("21 items");
  await expect(cards).toHaveCount(12);

  await page.getByRole("button", { name: "Show more (9 left)" }).click();
  await expect(cards).toHaveCount(21);
  await expect(page.getByRole("button", { name: /Show more/ })).toHaveCount(0);
});

test("a failed Show more keeps what's loaded and can try again", async ({ page }) => {
  await page.goto("/shop");
  const cards = page.locator("#catalogue article");
  await expect(cards).toHaveCount(12);

  await mockShopApi(page, { failing: true });
  await page.getByRole("button", { name: "Show more (9 left)" }).click();
  await expect(page.getByText("We couldn't load more items. Please try again.")).toBeVisible();
  await expect(cards).toHaveCount(12);

  await mockShopApi(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(cards).toHaveCount(21);
});

test("when the shop can't load it says so, offers WhatsApp and can try again", async ({ page }) => {
  await mockShopApi(page, { failing: true });
  await page.goto("/shop");
  await expect(page.getByRole("alert")).toContainText("We couldn't load the shop just now");
  await expect(page.getByRole("link", { name: "Ask on WhatsApp" }).first()).toBeVisible();
  await expect(count(page)).toHaveCount(0);

  await mockShopApi(page);
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(count(page)).toHaveText("21 items");
});

test("an empty shop says stock is coming, not that nothing matches", async ({ page }) => {
  await mockShopApi(page, { products: [] });
  await page.goto("/shop");
  await expect(page.getByText("New stock is on its way")).toBeVisible();
  await expect(page.getByText("Nothing matches")).toHaveCount(0);
});

test("an old link to something sold says so and leads back", async ({ page }) => {
  await page.goto("/shop?item=SM-9999");
  const sheet = page.getByRole("dialog", { name: "This item is no longer available" });
  await expect(sheet).toBeVisible();
  await sheet.getByRole("button", { name: "Back to the shop" }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(sheet).toHaveCount(0);
});

test("a link works for an item beyond the first page", async ({ page }) => {
  const last = shopProducts.at(-1)!;
  await page.goto(`/shop?item=${last.code}`);
  await expect(page.getByRole("dialog", { name: last.name })).toBeVisible();
});

test("a one-size item with no photo adds straight to the bag", async ({ page }) => {
  await page.goto("/shop?q=tote");
  await expect(page.locator("#catalogue article").getByText("One size")).toBeVisible();
  await expect(async () => {
    const add = page.getByRole("button", { name: "Add Canvas tote" });
    if (await add.isVisible()) await add.click();
    await expect(
      page.getByRole("button", { name: "Canvas tote is in your bag, add another size" }),
    ).toBeVisible({ timeout: 1_000 });
  }).toPass({ timeout: 15_000 });

  await page.getByRole("button", { name: "View bag" }).click();
  const bag = page.getByRole("dialog", { name: "Your bag" });
  await expect(bag.getByText("SM-1301", { exact: true })).toBeVisible();
});

test("sample items left in a saved bag are dropped", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "streetmart-bag",
      JSON.stringify([{ id: "SM-1001:M", name: "Old sample", price: 1200, qty: 1, max: 1 }]),
    );
  });
  await page.goto("/shop");
  await expect(count(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "View bag" })).toHaveCount(0);
});

test("saved delivery and contact settings replace the defaults", async ({ page }) => {
  await mockShopApi(page, {
    settings: {
      deliveryFee: 150,
      deliveryFreeFrom: 3000,
      phone: "254700000001",
      weekOpen: 8,
      weekClose: 18,
      sundayOpen: 10,
      sundayClose: 14,
    },
  });
  await page.goto("/shop");
  await expect(page.getByText("Free delivery over KSh 3,000")).toBeVisible();
  await expect(page.getByText("Monday – Saturday: 8:00 AM – 6:00 PM")).toBeVisible();
  const ask = page.getByRole("link", { name: "Ask on WhatsApp" }).first();
  await expect(ask).toHaveAttribute("href", /wa\.me\/254700000001/);
  await expect(page.locator("footer").getByRole("link", { name: /^Call/ })).toHaveAttribute(
    "href",
    "tel:+254700000001",
  );
});

test("the About page shows no email", async ({ page }) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(await page.content()).not.toContain("@gmail.com");
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
});
