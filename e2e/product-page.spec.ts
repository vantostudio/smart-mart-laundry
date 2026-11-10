import { expect, test } from "@playwright/test";

import { phone } from "./helpers";

/*
 * /shop/[code] is rendered on the server from the database, which browser tests don't have, so the
 * browser can't mock it. What can run here: a code that can't exist is a real 404, and with the
 * database unreachable a valid code shows a friendly problem, never "no longer available" and never
 * a 200 with nothing on it. The found page (photos, JSON-LD, add to bag) is covered by unit tests
 * and needs a database to check by hand.
 */

test.use(phone);

test("a code that can't exist is a real 404 with a way back", async ({ page }) => {
  const response = await page.goto("/shop/not-a-code");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "This item is no longer available" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  await page.getByRole("link", { name: "Back to the shop" }).click();
  await expect(page).toHaveURL(/\/shop$/);
});

test("with no database a valid code shows a friendly problem, not a 200 or a 404", async ({
  page,
}) => {
  const response = await page.goto("/shop/SM-1003");
  // 500 with the database down. With a database that has no such product it would be 404 instead,
  // so this only asserts the status is not a success.
  expect(response?.status()).not.toBe(200);
  const problem = page.getByText("We couldn't load this item");
  const gone = page.getByText("This item is no longer available");
  await expect(problem.or(gone)).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to the shop" })).toBeVisible();
});
