import { afterAll, beforeAll, describe, expect, it, vi } from "vite-plus/test";

import { thumbnailKey } from "@/features/products/lib/image-keys";
import { laundryItem } from "@/lib/db/schema";
import { createTestDb } from "@/lib/db/test-db";

import { laundryItems, laundryPhoto } from "../data";
import { isUploadedPhoto, listLaundryItems } from "./items";

vi.mock("server-only", () => ({}));

let t: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  t = await createTestDb();
}, 60_000);

afterAll(async () => {
  await t.close();
});

const photoUrl = (key: string) => `https://photos.test/${key}`;

describe("listLaundryItems", () => {
  it("starts with exactly what data.ts holds, so a failed read looks the same", async () => {
    expect(await listLaundryItems(t.db, photoUrl)).toEqual(
      laundryItems.map((item) => ({ mark: null, ...item })),
    );
  });

  it("shows an uploaded photo as its thumbnail", async () => {
    const key = "products/00000000-0000-4000-8000-000000000001.jpg";
    await t.db.insert(laundryItem).values({
      id: "new-one",
      category: "mats",
      name: "New",
      description: "New.",
      price: 10,
      image: key,
      position: 99,
    });
    const items = await listLaundryItems(t.db, photoUrl);
    expect(items.at(-1)?.image).toBe(photoUrl(thumbnailKey(key)));
    expect(laundryPhoto(items.at(-1)!.image, 400)).toBe(photoUrl(thumbnailKey(key)));
  });
});

describe("isUploadedPhoto", () => {
  it("tells our uploads from Unsplash ids", () => {
    expect(isUploadedPhoto("products/a.jpg")).toBe(true);
    expect(isUploadedPhoto("photo-1558618666-fcd25c85cd64")).toBe(false);
  });
});
