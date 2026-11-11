import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

// Shared cache for prerendered pages and `use cache` entries (KV: R2 isn't enabled on the account),
// tags in D1 so `revalidateTag` reaches every Worker instance at once, and time-based revalidation
// through the Worker's own service binding. See docs/decisions/0002-server-cached-public-reads.md.
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: d1NextTagCache,
  queue: memoryQueue,
});
