import { readFileSync } from "node:fs";

type RateLimitConfig = {
  name: string;
  namespace_id: string;
  simple: { limit: number; period: number };
};

/** The parts of a Worker environment in `wrangler.jsonc` the tests check. */
export type WorkerEnv = {
  name: string;
  routes?: { pattern: string; custom_domain?: boolean }[];
  workers_dev?: boolean;
  compatibility_flags?: string[];
  kv_namespaces?: { binding: string; id: string }[];
  d1_databases?: { binding: string; database_id: string }[];
  ratelimits?: RateLimitConfig[];
};

/** `wrangler.jsonc` with its whole-line comments and trailing commas dropped. */
export function readWranglerConfig(): WorkerEnv & { env: Record<string, WorkerEnv> } {
  const jsonc = readFileSync("wrangler.jsonc", "utf8")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/,(\s*[}\]])/g, "$1");
  return JSON.parse(jsonc);
}
