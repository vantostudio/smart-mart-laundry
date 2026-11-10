import { expect, test } from "@playwright/test";

/* The uptime check: a fresh `{ ok: true }` on every request, never cached, with no env set. */

test("GET /api/health answers ok and isn't cached", async ({ request }) => {
  for (let i = 0; i < 2; i++) {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/json");
    expect(response.headers()["cache-control"]).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true });
  }
});
