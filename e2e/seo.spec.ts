import { expect, test, type Page } from "@playwright/test";

/*
 * What search engines and phones read: titles and descriptions that name Chuka and the areas we
 * serve, valid structured data on every page, the logo icons, the manifest, sitemap and robots.
 */

async function jsonLd(page: Page) {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.map((b) => JSON.parse(b) as Record<string, unknown>);
}

for (const { path, title } of [
  { path: "/", title: /Laundry Pickup & Mtumba Clothes in Chuka/ },
  { path: "/laundry", title: /Laundry Service in Chuka/ },
  { path: "/shop", title: /Clothes and Shoes in Chuka/ },
  { path: "/about", title: /Street Mart, Chuka/ },
]) {
  test(`${path} names the place and describes the business`, async ({ page }) => {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toMatch(/Chuka/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      /streetmart\.africa/,
    );

    const business = (await jsonLd(page))
      .flatMap((d) => (d["@graph"] as Record<string, unknown>[] | undefined) ?? [d])
      .find((d) => Array.isArray(d["@type"]) && d["@type"].includes("DryCleaningOrLaundry"));
    expect(business).toMatchObject({ address: { addressLocality: "Chuka" } });

    // The areas are in the visible page too, not only in the metadata.
    await expect(page.locator("footer")).toContainText("Chuka University, Ndagani and Chuka town");
  });
}

test("/laundry lists its prices as structured data", async ({ page }) => {
  await page.goto("/laundry");
  const service = (await jsonLd(page)).find((d) => d["@type"] === "Service");
  expect(JSON.stringify(service)).toContain('"name":"Small basket"');
});

test("logo icons, manifest, sitemap and robots are served", async ({ page, request }) => {
  await page.goto("/");
  // favicon.ico too: browsers ask for it directly and would otherwise keep a cached old icon.
  const icons = await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').all();
  const types = await Promise.all(
    icons.map(async (link) => {
      const res = await request.get((await link.getAttribute("href"))!);
      expect(res.ok()).toBe(true);
      return res.headers()["content-type"];
    }),
  );
  expect(types).toEqual(
    expect.arrayContaining([
      expect.stringContaining("image/x-icon"),
      expect.stringContaining("image/svg+xml"),
      expect.stringContaining("image/png"),
    ]),
  );

  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest).toMatchObject({ short_name: "Street Mart" });
  expect(await (await request.get("/sitemap.xml")).text()).toContain("/shop");
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap:");
});
