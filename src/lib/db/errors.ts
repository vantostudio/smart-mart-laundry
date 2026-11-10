/**
 * Only what is safe to log from a failed query: the driver error's name and code. Drizzle's query
 * error puts the params in its message and on itself, so it never goes to a log whole.
 */
export function driverFailure(err: unknown): { errorName: string; errorCode: string | null } {
  const driver = err instanceof Error && err.cause instanceof Error ? err.cause : err;
  const { name, code } = (driver ?? {}) as { name?: unknown; code?: unknown };
  return {
    errorName: typeof name === "string" ? name : "unknown",
    errorCode: typeof code === "string" ? code : null,
  };
}
