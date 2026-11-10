import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import type { Db } from "@/lib/db/types";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/log", () => ({ log: { warn: vi.fn() } }));
vi.mock("@/lib/request-id", () => ({ getRequestId: async () => "req-1" }));
vi.mock("@/lib/storage", () => ({ deleteObject: vi.fn(() => new Promise(() => {})) }));

const { log } = await import("@/lib/log");
const { deleteObject } = await import("@/lib/storage");
const { removePhotos } = await import("./photos");

/** Each read answers one list of rows: products first, then laundry items. */
const rowsUsing = (...lists: unknown[][]) => {
  const answers = [...lists];
  return {
    select: () => ({ from: () => ({ where: async () => answers.shift() ?? [] }) }),
  } as unknown as Db;
};
const noRowsUseIt = rowsUsing();

afterEach(() => {
  vi.useRealTimers();
  vi.mocked(deleteObject).mockClear();
});

describe("removePhotos", () => {
  it("keeps a photo a laundry item uses", async () => {
    const db = rowsUsing([], [{ image: "products/a.jpg" }]);
    await removePhotos(db, ["products/a.jpg"]);
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("keeps a photo a product uses", async () => {
    const db = rowsUsing([{ images: ["products/a.jpg"] }], []);
    await removePhotos(db, ["products/a.jpg"]);
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("gives up on a stalled bucket so a save isn't held up", async () => {
    vi.useFakeTimers();
    const done = removePhotos(noRowsUseIt, ["products/a.jpg"]);
    await vi.advanceTimersByTimeAsync(4000);
    await done;
    expect(log.warn).toHaveBeenCalledWith("photo_delete_failed", expect.anything());
  });
});
