// The Worker's entry: load the timer shim before Next.js, answer `/photos/*` from the edge cache
// (decision 0003), and hand everything else to OpenNext untouched.
import "./next-immediates.mjs";

import openNext from "../.open-next/worker.js";
import { servePhoto } from "../src/lib/photo-proxy.ts";

export * from "../.open-next/worker.js";

/* One JSON line in the `src/lib/log.ts` shape, which can't be imported here. */
function log(level, msg, fields) {
  const { requestId, ...extra } = fields;
  console[level](JSON.stringify({ level, msg, requestId, ...extra }));
}

export default {
  fetch(request, env, ctx) {
    if (new URL(request.url).pathname.startsWith("/photos/")) {
      return servePhoto(request, {
        endpoint: env.AWS_ENDPOINT_URL_S3,
        cache: caches.default,
        waitUntil: (p) => ctx.waitUntil(p),
        log,
      });
    }
    return openNext.fetch(request, env, ctx);
  },
};
