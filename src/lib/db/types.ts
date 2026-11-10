import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";

import type * as schema from "./schema";

/*
 * Any Drizzle Postgres client over our schema: neon-http in the app, PGlite in tests. Data
 * functions take a `db: Db` argument. Its own file, safe outside the server, so the seed script and
 * tests can use it.
 */
export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;
