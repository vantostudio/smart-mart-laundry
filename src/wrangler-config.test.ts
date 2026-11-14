import { describe, expect, it } from "vite-plus/test";

import { readWranglerConfig } from "@/test/wrangler-config";

const config = readWranglerConfig();
const environments = Object.entries(config.env);

describe("wrangler.jsonc", () => {
  it("keeps the live domains on the production Worker", () => {
    expect(config.routes?.map((r) => r.pattern)).toEqual([
      "streetmart.africa",
      "www.streetmart.africa",
    ]);
    // `routes` is inherited, so a named env without its own list takes the live domains.
    for (const [, env] of environments) {
      expect(env.routes).toEqual([]);
      expect(env.workers_dev).toBe(true);
    }
  });

  it("gives every other environment its own Worker and cache", () => {
    for (const [, env] of environments) {
      expect(env.name).not.toBe(config.name);
      expect(env.kv_namespaces?.map((kv) => kv.binding)).toEqual(["NEXT_INC_CACHE_KV"]);
      expect(env.kv_namespaces?.[0]?.id).not.toBe(config.kv_namespaces?.[0]?.id);
      expect(env.d1_databases?.map((d1) => d1.binding)).toEqual(["NEXT_TAG_CACHE_D1"]);
      expect(env.d1_databases?.[0]?.database_id).not.toBe(config.d1_databases?.[0]?.database_id);
    }
  });

  it("lets Next's shared cache promises settle across requests", () => {
    expect(config.compatibility_flags).toContain("no_handle_cross_request_promise_resolution");
  });
});
