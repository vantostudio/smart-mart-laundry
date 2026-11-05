import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { defaultShopSettings } from "@/config/shop-settings";
import { createTestDb } from "@/lib/db/test-db";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/features/admin/lib/auth", () => ({ requireAdminForAction: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }));

const { requireAdminForAction } = await import("@/features/admin/lib/auth");
const { getDb } = await import("@/lib/db");
const { revalidateTag } = await import("next/cache");
const { PATCH } = await import("./route");

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
  vi.mocked(getDb).mockReturnValue(t.db as never);
}, 60_000);

afterAll(async () => {
  await t.close();
});

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
  vi.mocked(requireAdminForAction).mockResolvedValue({
    ok: true,
    admin: { adminId: "a", email: "a@example.com", name: null, role: "owner" },
  });
});

const patch = (body: unknown) =>
  new Request("http://shop.test/api/admin/settings", {
    method: "PATCH",
    headers: { origin: "http://shop.test", host: "shop.test" },
    body: JSON.stringify(body),
  });

describe("PATCH /api/admin/settings", () => {
  it("saves, and expires the cached settings so the site shows the edit at once", async () => {
    const res = await PATCH(patch({ deliveryFee: 150 }), undefined);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ...defaultShopSettings, deliveryFee: 150 });
    expect(revalidateTag).toHaveBeenCalledWith("settings", { expire: 0 });
  });

  it("expires nothing when the change is refused", async () => {
    const res = await PATCH(patch({ deliveryFee: -1 }), undefined);
    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
