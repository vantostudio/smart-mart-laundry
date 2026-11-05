/*
 * The one error model for server code. Codes live here and nowhere else. An `AppError` message is
 * safe for people to read: never values, SQL, driver text or a stack. Person-facing copy per code
 * lives in `src/features/admin/messages.ts`. Safe for client code, which imports the types.
 */

export const appErrorCodes = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "VALIDATION",
  "NOT_FOUND",
  "ALREADY_EXISTS",
  "LAST_OWNER",
  "CANNOT_CHANGE_SELF",
  "AUTH_UNAVAILABLE",
  "RATE_LIMITED",
  "INTERNAL",
] as const;

export type AppErrorCode = (typeof appErrorCodes)[number];

export type AppErrorShape = {
  code: AppErrorCode;
  message: string;
  field?: string;
  requestId: string;
};

export class AppError extends Error {
  override name = "AppError";
  readonly code: AppErrorCode;
  readonly field?: string;

  constructor(code: AppErrorCode, message: string, options?: { field?: string; cause?: unknown }) {
    super(message, options?.cause === undefined ? undefined : { cause: options.cause });
    this.code = code;
    if (options?.field !== undefined) this.field = options.field;
  }
}

/** What people get for anything unexpected. */
export const internalErrorMessage = "Internal error";

/**
 * The shape sent to a client. Pure: callers log unexpected errors at their boundary. Anything that
 * isn't an `AppError` becomes `INTERNAL`, with no text from the original error.
 */
export function toErrorShape(err: unknown, requestId: string): AppErrorShape {
  if (err instanceof AppError) {
    return {
      code: err.code,
      message: err.message,
      ...(err.field === undefined ? {} : { field: err.field }),
      requestId,
    };
  }
  return { code: "INTERNAL", message: internalErrorMessage, requestId };
}
