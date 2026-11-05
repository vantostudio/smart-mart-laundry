import { call, json, type Result } from "@/features/admin/lib/api-call";

import type { CreateProductInput } from "../schema";
import type { Product } from "./products";

/* What the products screens call in the browser. */

export type Photo = { key: string; url: string };

export type ProductDraft = CreateProductInput;

const BASE = "/api/admin/products";

export function saveProduct(id: string | undefined, draft: ProductDraft): Promise<Result<Product>> {
  return id === undefined
    ? call(BASE, json("POST", draft))
    : call(`${BASE}/${id}`, json("PATCH", draft));
}

export function deleteProduct(id: string): Promise<Result<void>> {
  return call(`${BASE}/${id}`, { method: "DELETE" });
}

/** Sends a photo with its thumbnail, in one request. */
export function uploadPhoto(photo: Blob, thumbnail: Blob): Promise<Result<Photo>> {
  const body = new FormData();
  body.set("file", photo);
  body.set("thumbnail", thumbnail);
  return call(`${BASE}/images`, { method: "POST", body });
}
