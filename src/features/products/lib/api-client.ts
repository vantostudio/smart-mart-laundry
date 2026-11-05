import { errorMessages, productMessages } from "@/features/admin/messages";
import type { AppErrorShape } from "@/lib/errors";

import type { CreateProductInput } from "../schema";
import type { Product } from "./products";

/* What the staff screens call in the browser. Failures come back as values, never thrown. */

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppErrorShape };

export type Photo = { key: string; url: string };

export type ProductDraft = CreateProductInput;

const BASE = "/api/admin/products";

const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

async function call<T>(path: string, init: RequestInit): Promise<Result<T>> {
  try {
    const response = await fetch(path, init);
    if (response.status === 204) return { ok: true, data: undefined as T };
    const body: unknown = await response.json();
    return response.ok
      ? { ok: true, data: body as T }
      : { ok: false, error: (body as { error: AppErrorShape }).error };
  } catch {
    return {
      ok: false,
      error: { code: "INTERNAL", message: productMessages.offline, requestId: "" },
    };
  }
}

export function saveProduct(id: string | undefined, draft: ProductDraft): Promise<Result<Product>> {
  return id === undefined
    ? call(BASE, json("POST", draft))
    : call(`${BASE}/${id}`, json("PATCH", draft));
}

export function deleteProduct(id: string): Promise<Result<void>> {
  return call(`${BASE}/${id}`, { method: "DELETE" });
}

export function uploadPhoto(photo: Blob): Promise<Result<Photo>> {
  const body = new FormData();
  body.set("file", photo);
  return call(`${BASE}/images`, { method: "POST", body });
}

/** The sentence to show. An unexpected failure gives the code to quote to the owner. */
export function errorText(error: AppErrorShape): string {
  return error.code === "INTERNAL" && error.requestId
    ? errorMessages.INTERNAL(error.requestId)
    : error.message;
}
