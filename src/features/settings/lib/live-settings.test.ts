import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { defaultShopSettings } from "@/config/shop-settings";
import { AppError } from "@/lib/errors";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/db", () => ({ getDb: vi.fn() }));
vi.mock("@/lib/log", () => ({ log: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("./settings", () => ({ getShopSettings: vi.fn() }));

const { cacheLife, cacheTag } = await import("next/cache");
const { log } = await import("@/lib/log");
const { getShopSettings } = await import("./settings");
const { getLiveShopSettings } = await import("./live-settings");

const saved = { ...defaultShopSettings, phone: "254700000001", deliveryFee: 150 };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getLiveShopSettings", () => {
  it("gives the saved values, tagged so a save can expire them, for hours", async () => {
    vi.mocked(getShopSettings).mockResolvedValue(saved);
    expect(await getLiveShopSettings()).toEqual(saved);
    expect(cacheTag).toHaveBeenCalledWith("settings");
    expect(cacheLife).toHaveBeenCalledOnce();
    expect(cacheLife).toHaveBeenCalledWith("hours");
  });

  it("falls back to the defaults, quietly, when the database env is missing", async () => {
    vi.mocked(getShopSettings).mockRejectedValue(new AppError("AUTH_UNAVAILABLE", "No env"));
    expect(await getLiveShopSettings()).toEqual(defaultShopSettings);
    expect(log.warn).not.toHaveBeenCalled();
  });

  it("falls back to the defaults and logs when the database fails, and keeps that only briefly", async () => {
    vi.mocked(getShopSettings).mockRejectedValue(new Error("connection refused"));
    expect(await getLiveShopSettings()).toEqual(defaultShopSettings);
    expect(log.warn).toHaveBeenCalledOnce();
    expect(cacheLife).toHaveBeenCalledOnce();
    expect(vi.mocked(cacheLife).mock.calls[0]![0]).toMatchObject({ revalidate: 30 });
  });
});
