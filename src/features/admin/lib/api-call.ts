import { errorMessages, productMessages } from "@/features/admin/messages";
import type { AppErrorShape } from "@/lib/errors";

/* How staff screens call the admin API in the browser. Failures come back as values, never thrown. */

export type Result<T> = { ok: true; data: T } | { ok: false; error: AppErrorShape };

export const json = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function failure(message: string): { ok: false; error: AppErrorShape } {
  return { ok: false, error: { code: "INTERNAL", message, requestId: "" } };
}

export async function call<T>(path: string, init: RequestInit): Promise<Result<T>> {
  let response: Response;
  try {
    response = await fetch(path, init);
  } catch {
    return failure(productMessages.offline);
  }
  if (response.status === 204) return { ok: true, data: undefined as T };
  try {
    const body: unknown = await response.json();
    return response.ok
      ? { ok: true, data: body as T }
      : { ok: false, error: (body as { error: AppErrorShape }).error };
  } catch {
    // Our API always answers JSON, so something between us and it answered instead.
    return failure(productMessages.notSaved);
  }
}

/** What to show for a failure. */
export type Problem = {
  message: string;
  field?: string | undefined;
  /** Add a way to sign in again that keeps this page open. */
  signedOut?: boolean;
};

/** "images.0" is the photos field. An unexpected failure gives the code to quote to the owner. */
export function problemFrom(error: AppErrorShape): Problem {
  if (error.code === "UNAUTHENTICATED") {
    return { message: productMessages.signedOut, signedOut: true };
  }
  const message =
    error.code === "INTERNAL" && error.requestId
      ? errorMessages.INTERNAL(error.requestId)
      : error.message;
  return { message, field: error.field?.split(".")[0] };
}
