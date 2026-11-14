// Runs after `opennextjs-cloudflare build` (`pnpm cf:build`): makes Next's stream scheduler wait a
// real task in the Worker bundle.
//
// usage:  node cloudflare/patch-stream-scheduler.mjs
//
// `next-immediates.mjs` turns `setImmediate` into a microtask so request-time renders don't hang.
// But Next's HTML stream also waits on `setImmediate` (`scheduleImmediate` and `atLeastOneTask` in
// `next/dist/lib/scheduler`) to let a chunk of the page finish before it inserts its own scripts.
// As a microtask that wait is no wait, and pages the Worker re-renders came out with a `<script>`
// spliced into the middle of a tag: class names shown as text and a page wider than the phone
// (2026-11-14). On the edge runtime Next uses `setTimeout(cb, 0)` there; this does the same, and
// leaves React's own `setImmediate` work fast. The build stops if the pattern is gone, so a Next
// upgrade can't drop the fix unnoticed. Drop this with the shim once the adapter ships #1318.
import { readFileSync, writeFileSync } from "node:fs";

const HANDLER = ".open-next/server-functions/default/handler.mjs";

// `scheduleImmediate = cb => { setImmediate(cb) }; function atLeastOneTask() { return new
// Promise(resolve => scheduleImmediate(resolve)) }`, minified, with or without esbuild's
// `__name(…, "name")` wrapper from `keepNames`.
const SCHEDULER =
  /([\w$]+)=(__name\()?([\w$]+)=>\{setImmediate\(\3\)\}((?:,"[\w$]+"\))?;function [\w$]+\(\)\{return new Promise\(([\w$]+)=>\1\(\5\)\)\})/g;

/** Returns the code with every copy of the scheduler patched, and how many there were. */
export function patchStreamScheduler(code) {
  let count = 0;
  const patched = code.replace(SCHEDULER, (_, name, wrapper = "", cb, rest) => {
    count++;
    return `${name}=${wrapper}${cb}=>{setTimeout(${cb},0)}${rest}`;
  });
  return { code: patched, count };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { code, count } = patchStreamScheduler(readFileSync(HANDLER, "utf8"));
  if (count === 0) {
    console.error(
      `cf:build stopped: Next's stream scheduler wasn't found in ${HANDLER}. Next must have ` +
        "changed it: check `next/dist/lib/scheduler.js` and update cloudflare/patch-stream-scheduler.mjs.",
    );
    process.exit(1);
  }
  writeFileSync(HANDLER, code);
  console.log(`Patched ${count} copies of Next's stream scheduler in ${HANDLER}.`);
}
