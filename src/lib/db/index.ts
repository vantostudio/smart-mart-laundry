import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { cache } from "react";

import { serverEnv } from "@/config/env";

import * as schema from "./schema";
import type { Db } from "./types";

export type { Db } from "./types";

/*
 * Neon over HTTP: no connection is held, and nothing is created at import. neon-http only fetches
 * when a query runs.
 */

export function createDb(url: string): Db {
  return drizzle({ client: neon(url), schema });
}

/** One client per request. */
export const getDb = cache(() => createDb(serverEnv().DATABASE_URL));
