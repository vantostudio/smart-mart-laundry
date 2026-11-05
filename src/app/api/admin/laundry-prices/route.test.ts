import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { laundryMessages } from "@/features/admin/messages";
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

const signedInAs = (role: "owner" | "admin") =>
  vi.mocked(requireAdminForAction).mockResolvedValue({
    ok: true,
    admin: { adminId: "a", email: "a@example.com", name: null, role },
  });

beforeEach(() => {
  vi.mocked(revalidateTag).mockClear();
  signedInAs("owner");
});

const patch = (body: unknown) =>
  new Request("http://shop.test/api/admin/laundry-prices", {
    method: "PATCH",
    headers: { origin: "http://shop.test", host: "shop.test" },
    body: JSON.stringify(body),
  });

const priceOf = async (id: string) =>
  (await t.client.query<{ price: number }>("select price from laundry_item where id = $1", [id]))
    .rows[0]?.price;

describe("PATCH /api/admin/laundry-prices", () => {
  it("saves every price sent, and expires the cached items so the site shows them at once", async () => {
    const res = await PATCH(patch({ "basket-small": 175, "mat-door": 60 }), undefined);
    expect(res.status).toBe(204);
    expect(await priceOf("basket-small")).toBe(175);
    expect(await priceOf("mat-door")).toBe(60);
    expect(revalidateTag).toHaveBeenCalledWith("laundry", { expire: 0 });
  });

  it("says what's wrong with a price, on its field, and changes nothing", async () => {
    const res = await PATCH(patch({ "basket-medium": 300, "basket-large": 0 }), undefined);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatchObject({
      code: "VALIDATION",
      field: "basket-large",
      message: laundryMessages.fields.price,
    });
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(await priceOf("basket-medium")).toBe(250);
  });

  it("changes nothing if one item doesn't exist", async () => {
    const res = await PATCH(patch({ "basket-medium": 300, "basket-giant": 500 }), undefined);
    expect(res.status).toBe(404);
    expect(await priceOf("basket-medium")).toBe(250);
  });

  it("refuses an empty save", async () => {
    expect((await PATCH(patch({}), undefined)).status).toBe(400);
  });

  it("is for the owner only", async () => {
    vi.mocked(requireAdminForAction).mockResolvedValue({
      ok: false,
      error: { code: "FORBIDDEN", message: "No", requestId: "req-1" },
    } as never);
    const res = await PATCH(patch({ "basket-small": 999 }), undefined);
    expect(res.status).toBe(403);
    expect(vi.mocked(requireAdminForAction)).toHaveBeenCalledWith({ role: "owner" });
  });
});
