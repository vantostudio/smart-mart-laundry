import "server-only";

import { cache } from "react";
import { z } from "zod";

import { AppError } from "@/lib/errors";

/*
 * Server env, parsed on first use in a request, never at import, so builds and checks run without
 * secrets. Locally `next dev` reads `.env.local`; on Workers, Wrangler secrets will feed
 * `process.env` later. Names are in `.env.example`. Neon Auth variables come with auth-core.
 */

const schema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
});

export type ServerEnv = z.infer<typeof schema>;

export const serverEnv = cache((): ServerEnv => {
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
});
