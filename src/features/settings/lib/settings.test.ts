import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test";

import { defaultShopSettings } from "@/config/shop-settings";
import { createTestDb } from "@/lib/db/test-db";

import { updateShopSettingsInput } from "../schema";
import { getShopSettings, updateShopSettings } from "./settings";

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

const valid = (patch: unknown) => updateShopSettingsInput.safeParse(patch).success;

describe("shop settings", () => {
  it("starts with today's values from the migration", async () => {
    expect(await getShopSettings(t.db)).toEqual(defaultShopSettings);
  });

  it("changes only what was sent, and keeps one row", async () => {
    const saved = await updateShopSettings(t.db, { deliveryFee: 150 });
    expect(saved).toEqual({ ...defaultShopSettings, deliveryFee: 150 });
    expect(await getShopSettings(t.db)).toEqual(saved);
    const { rows } = await t.client.query("select count(*)::int as n from shop_settings");
    expect(rows).toEqual([{ n: 1 }]);
  });

  it("cannot hold a second row", async () => {
    await expect(
      t.client.exec(
        "insert into shop_settings (id, delivery_fee, delivery_free_from, phone, week_open, week_close, sunday_open, sunday_close) values (false, 0, 0, '', 1, 2, 1, 2)",
      ),
    ).rejects.toThrow();
  });
});

describe("updateShopSettingsInput", () => {
  it("accepts the ways people write a Kenyan number", () => {
    for (const phone of ["0113 154 708", "+254 113 154 708", "254113154708", "(0113) 154-708"]) {
      expect(updateShopSettingsInput.parse({ phone })).toEqual({ phone: "254113154708" });
    }
    expect(updateShopSettingsInput.parse({ phone: "0712345678" })).toEqual({
      phone: "254712345678",
    });
  });

  it("refuses numbers that aren't Kenyan mobiles", () => {
    for (const phone of ["12345", "0213154708", "254113154", "+1 202 555 0100"]) {
      expect(valid({ phone })).toBe(false);
    }
  });

  it("needs both ends of a day, closing after opening", () => {
    expect(valid({ weekOpen: 8, weekClose: 18 })).toBe(true);
    expect(valid({ sundayOpen: 0, sundayClose: 24 })).toBe(true);
    expect(valid({ weekOpen: 8 })).toBe(false);
    expect(valid({ weekClose: 18 })).toBe(false);
    expect(valid({ weekOpen: 18, weekClose: 8 })).toBe(false);
    expect(valid({ sundayOpen: 9, sundayClose: 9 })).toBe(false);
    expect(valid({ weekOpen: 7.5, weekClose: 18 })).toBe(false);
    expect(valid({ weekOpen: 7, weekClose: 25 })).toBe(false);
  });

  it("refuses money that isn't whole shillings, an empty patch and unknown fields", () => {
    expect(valid({ deliveryFee: -1 })).toBe(false);
    expect(valid({ deliveryFee: 10.5 })).toBe(false);
    expect(valid({})).toBe(false);
    expect(valid({ id: false })).toBe(false);
  });
});
