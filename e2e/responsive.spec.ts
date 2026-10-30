import { expect, test, type Page } from "@playwright/test";

import { device } from "./helpers";

/*
 * Every page at phone, tablet and desktop widths: no sideways scroll, the type scale in
 * src/app/globals.css lands on the right step for the device class, tap targets are at least
 * 44px and form fields 16px. Section screenshots for review go to .audit/sections/.
 */

// h2: the first section heading on the page (/laundry's category titles are deliberately smaller).
const pages = [
  { path: "/", h1: "display-xl", h2: "#services h2" },
  { path: "/laundry", h1: "display-lg", h2: "#prices h2" },
  { path: "/shop", h1: "display-lg", h2: "main h2:not(.sr-only)" },
  { path: "/about", h1: "display-lg", h2: "main h2" },
] as const;

// Expected px per device class, mirroring the table in globals.css.
const scale = {
  phone: { "display-xl": 38, "display-lg": 32, display: 28, body: 15 },
  tablet: { "display-xl": 52, "display-lg": 42, display: 36, body: 16 },
  desktop: { "display-xl": 72, "display-lg": 56, display: 44, body: 16 },
} as const;

const viewports = [
  { width: 320, height: 568, mobile: true },
  { width: 360, height: 740, mobile: true },
  { width: 390, height: 844, mobile: true },
  { width: 430, height: 932, mobile: true },
  { width: 768, height: 1024, mobile: true },
  { width: 1024, height: 768, mobile: true },
  { width: 1280, height: 800, mobile: false },
  { width: 1920, height: 1080, mobile: false },
];

const SHOT_WIDTHS = [360, 768, 1280];

const deviceClass = (w: number) => (w < 640 ? "phone" : w < 1024 ? "tablet" : "desktop");

/** Scroll through so lazy images load and scroll-linked UI settles, then back to the top. */
async function settle(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
}

for (const vp of viewports) {
  test.describe(`${vp.width}px`, () => {
    test.use(device(vp));

    for (const { path, h1, h2 } of pages) {
      test(path, async ({ page }) => {
        await page.goto(path);
        await settle(page);
        const expected = scale[deviceClass(vp.width)];

        const m = await page.evaluate((h2Selector) => {
          const size = (el: Element | null) => (el ? parseFloat(getComputedStyle(el).fontSize) : 0);
          const visible = (el: Element) => {
            const r = el.getBoundingClientRect();
            return r.width > 1 && r.height > 1 && getComputedStyle(el).visibility !== "hidden";
          };
          // Inline links inside running text are exempt from the 44px rule (WCAG 2.5.8).
          const inText = (el: Element) => el.matches("p a, li > a.text-link, p a *");
          const targets = [...document.querySelectorAll("a, button, select, summary, [role=radio]")]
            .filter((el) => visible(el) && !inText(el) && !el.closest("[aria-hidden=true]"))
            .map((el) => {
              // A select inside a label is tapped through the whole label.
              const r = (
                el.matches("select") ? (el.closest("label") ?? el) : el
              ).getBoundingClientRect();
              return {
                label: (
                  (el as HTMLElement).innerText ||
                  el.getAttribute("aria-label") ||
                  el.tagName
                )
                  .trim()
                  .slice(0, 40),
                w: Math.round(r.width),
                h: Math.round(r.height),
              };
            })
            .filter((t) => t.h < 44 && t.label !== "Skip to content");
          return {
            scrollWidth: document.documentElement.scrollWidth,
            h1: size(document.querySelector("h1")),
            h2: size(document.querySelector(h2Selector)),
            body: size(document.body),
            weight: Number(getComputedStyle(document.body).fontWeight),
            smallFields: [...document.querySelectorAll("input, select, textarea")]
              .filter((el) => visible(el) && size(el) < 16)
              .map((el) => el.getAttribute("name") ?? el.tagName),
            smallTargets: targets,
          };
        }, h2);

        expect.soft(m.scrollWidth, "no sideways scroll").toBeLessThanOrEqual(vp.width);
        expect.soft(m.h1, "h1 size").toBe(expected[h1]);
        expect.soft(m.h2, "h2 size").toBe(expected.display);
        expect.soft(m.body, "body size").toBe(expected.body);
        // Phones get slightly heavier text; tablet and desktop use the regular weight.
        expect.soft(m.weight, "body weight").toBe(vp.width < 640 ? 450 : 400);
        expect.soft(m.smallFields, "form fields under 16px").toEqual([]);
        expect.soft(m.smallTargets, "tap targets under 44px").toEqual([]);

        if (SHOT_WIDTHS.includes(vp.width)) {
          const name = path === "/" ? "home" : path.slice(1);
          // The sticky header would sit on top of every scrolled-to section in the shots.
          await page.addStyleTag({ content: "header { visibility: hidden !important; }" });
          const sections = page.locator("main section");
          const count = await sections.count();
          for (let i = 0; i < count; i++) {
            await sections.nth(i).screenshot({
              path: `.audit/sections/${name}-${vp.width}-${i}.png`,
              animations: "disabled",
            });
          }
        }
      });
    }
  });
}
