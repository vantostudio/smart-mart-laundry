import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Read-only cache of prerendered pages in Static Assets; move to R2 for on-demand revalidation.
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache });
