import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { Db } from "@/lib/db/types";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/log", () => ({ log: { warn: vi.fn() } }));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/lib/storage", () => ({ deleteObject: () => new Promise(() => {}) }));

const { log } = await import("@/lib/log");
const { removePhotos } = await import("./photos");

const noRowsUseIt = {
  select: () => ({ from: () => ({ where: async () => [] }) }),
} as unknown as Db;

afterEach(() => {
  vi.useRealTimers();
});

describe("removePhotos", () => {
  it("gives up on a stalled bucket so a save isn't held up", async () => {
    vi.useFakeTimers();
    const done = removePhotos(noRowsUseIt, ["products/a.jpg"]);
    await vi.advanceTimersByTimeAsync(4000);
    await done;
    expect(log.warn).toHaveBeenCalledWith("photo_delete_failed", expect.anything());
  });
});
