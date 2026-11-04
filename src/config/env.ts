import "server-only";

import { cache } from "react";
import { z } from "zod";

import { AppError } from "@/lib/errors";

/*
 * Server env, parsed on first use in a request, never at import, so builds and checks run without
 * secrets. Locally `next dev` reads `.env.local`; on Workers, Wrangler secrets will feed
 * `process.env` later. Names are in `.env.example`. `serverEnv()` holds what the database needs,
 * `authEnv()` what Neon Auth needs, so the database and `/api/health` never need auth secrets.
 */

const serverSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

const authSchema = z.object({
  /** From `neon deploy`, path included. */
  NEON_AUTH_BASE_URL: z.url({ protocol: /^https$/ }),
  /** Ours, from `openssl rand -base64 32`. The SDK refuses anything shorter than 32. */
  NEON_AUTH_COOKIE_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type AuthEnv = z.infer<typeof authSchema>;

function parseEnv<T>(schema: z.ZodType<T>): T {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    // Name the variables only; the issue messages could echo a value.
    const names = [...new Set(parsed.error.issues.map((issue) => String(issue.path[0])))];
    throw new AppError(
      "AUTH_UNAVAILABLE",
      `Server configuration is missing or invalid: ${names.join(", ")}.`,
      { cause: { variables: names } },
    );
  }
  return parsed.data;
}

export const serverEnv = cache((): ServerEnv => parseEnv(serverSchema));

export const authEnv = cache((): AuthEnv => parseEnv(authSchema));
