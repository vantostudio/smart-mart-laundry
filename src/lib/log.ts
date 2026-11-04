import "server-only";

/*
 * Structured logs: one JSON line per call over `console`, which the host collects. Never log
 * cookies, tokens or env values.
 */

type Level = "debug" | "info" | "warn" | "error";

export type LogFields = { requestId: string; adminId?: string; [key: string]: unknown };

const method = { debug: "log", info: "log", warn: "warn", error: "error" } as const;

function serialise(_key: string, value: unknown): unknown {
  if (value instanceof Error)
    return { name: value.name, message: value.message, stack: value.stack };
  if (typeof value === "bigint") return value.toString();
  return value;
}

function line(level: Level, msg: string, fields: LogFields): string {
  const { requestId, adminId, ...extra } = fields;
  const head = { level, msg, requestId, ...(adminId === undefined ? {} : { adminId }) };
  try {
    // `head` twice: first for key order, then so extra fields can't overwrite it.
    return JSON.stringify({ ...head, ...extra, ...head }, serialise);
  } catch {
    // Circular fields: keep the line, drop the extras.
    return JSON.stringify({ ...head, unserialisable: true });
  }
}

function write(level: Level, msg: string, fields: LogFields) {
  console[method[level]](line(level, msg, fields));
}

export const log = {
  debug: (msg: string, fields: LogFields) => write("debug", msg, fields),
  info: (msg: string, fields: LogFields) => write("info", msg, fields),
  warn: (msg: string, fields: LogFields) => write("warn", msg, fields),
  error: (msg: string, fields: LogFields) => write("error", msg, fields),
};
