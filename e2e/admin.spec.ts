import { expect, test, type Page } from "@playwright/test";

import { device } from "./helpers";

/*
 * The staff area with no auth or database env, as the checks run it: /admin sends people to
 * sign-in with the outage message, the sign-in page fits every width, `?reason=` only ever picks
 * known copy, and /admin stays out of search results, frames and caches.
 */

const unavailable = "Sign-in isn't available right now. Please try again in a few minutes.";

const viewports = [
  { width: 320, height: 568, mobile: true },
  { width: 360, height: 740, mobile: true },
  { width: 390, height: 844, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1024, height: 768, mobile: true },
  { width: 1280, height: 800, mobile: false },
  { width: 1920, height: 1080, mobile: false },
];

/** Ours, not Next's route announcer (also `role="alert"`, outside `main`). */
const alert = (page: Page) => page.locator("main").getByRole("alert");

/** The button is disabled until the page has hydrated. */
async function googleButton(page: Page) {
  const button = page.getByRole("button", { name: "Continue with Google" });
  await expect(button).toBeEnabled();
  return button;
}

test("/admin sends people to sign-in with the outage message", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL((url) => url.pathname === "/admin/sign-in");
  await expect(alert(page)).toHaveText(unavailable);
  await googleButton(page);
  // No site chrome: header nav, footer, phone action bar or cart bar.
  await expect(page.locator("header, footer, nav")).toHaveCount(0);
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
});

for (const vp of viewports) {
  test.describe(`${vp.width}px`, () => {
    test.use(device(vp));

    test("/admin/sign-in fits and has 44px targets", async ({ page }) => {
      await page.goto("/admin/sign-in");
      await expect(page.getByRole("heading", { level: 1, name: "Staff sign-in" })).toBeVisible();
      await expect(await googleButton(page)).toBeVisible();

      // The same measurement as e2e/responsive.spec.ts.
      const m = await page.evaluate(() => {
        const visible = (el: Element) => {
          const r = el.getBoundingClientRect();
          return r.width > 1 && r.height > 1 && getComputedStyle(el).visibility !== "hidden";
        };
        const inText = (el: Element) => el.matches("p a, li > a.text-link, p a *");
        const targets = [...document.querySelectorAll("a, button")]
          .filter((el) => visible(el) && !inText(el) && !el.closest("[aria-hidden=true]"))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              label: ((el as HTMLElement).innerText || el.getAttribute("aria-label") || el.tagName)
                .trim()
                .slice(0, 40),
              h: Math.round(r.height),
            };
          })
          .filter((t) => t.h < 44);
        return { scrollWidth: document.documentElement.scrollWidth, smallTargets: targets };
      });

      expect.soft(m.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(vp.width);
      expect.soft(m.smallTargets, "tap targets under 44px").toEqual([]);
    });
  });
}

test("a known reason shows its copy", async ({ page }) => {
  await page.goto("/admin/sign-in?reason=SIGN_IN_CANCELLED");
  await expect(alert(page)).toHaveText("Sign-in was cancelled. Try again.");
  await googleButton(page);
});

test("an unknown reason is never shown", async ({ page }) => {
  await page.goto("/admin/sign-in?reason=NOT_A_CODE_x9");
  await googleButton(page);
  expect(await page.locator("body").innerText()).not.toContain("NOT_A_CODE_x9");
  // With no env, the only message is the outage.
  await expect(alert(page)).toHaveText(unavailable);
});

test("markup in the reason renders nothing", async ({ page }) => {
  await page.goto("/admin/sign-in?reason=%3Cimg%20src%3Dx%3E");
  await googleButton(page);
  await expect(page.locator(`main img[src="x"]`)).toHaveCount(0);
  expect(await page.locator("body").innerText()).not.toContain("img");
  await expect(alert(page)).toHaveText(unavailable);
});

test("admin pages are noindex and public pages aren't", async ({ page }) => {
  await page.goto("/admin/sign-in");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);

  await page.goto("/");
  const robots = page.locator('meta[name="robots"]');
  if ((await robots.count()) > 0) {
    await expect(robots).not.toHaveAttribute("content", /noindex/);
  }
});

test("robots.txt keeps crawlers out of /admin and /api/", async ({ request }) => {
  const text = await (await request.get("/robots.txt")).text();
  expect(text).toContain("Disallow: /admin");
  expect(text).toContain("Disallow: /api/");
  expect(text).toContain("Sitemap:");
});

for (const path of ["/admin/sign-in", "/admin", "/admin/settings"]) {
  test(`GET ${path} can't be framed or cached`, async ({ request }) => {
    const response = await request.get(path, { maxRedirects: 0 });
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["referrer-policy"]).toBe("same-origin");
    expect(headers["cache-control"]).toContain("private");
    expect(headers["cache-control"]).toContain("no-store");
  });
}

test("GET / carries none of the admin headers", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["x-frame-options"]).toBeUndefined();
  expect(headers["content-security-policy"]).toBeUndefined();
  expect(headers["referrer-policy"]).toBeUndefined();
});
