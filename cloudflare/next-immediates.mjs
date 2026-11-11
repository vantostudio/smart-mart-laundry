/*
 * Must load before Next.js. Cache Components finds the end of each render stage by draining
 * `setImmediate` work after `process.nextTick`. Node runs `nextTick` after the microtask queue;
 * workerd runs it as an ordinary microtask, so Next stops waiting too early and requests that render
 * at request time hang ("Worker's code had hung"). Next keeps the original timer functions under a
 * global symbol and only fills it in when empty, so seeding it here gives Next immediates that run
 * as microtasks, like Node's order. Every MAX_CHAINED-th one goes to the native immediate so a
 * runaway chain still yields to I/O. Upstream fix pending: opennextjs/opennextjs-cloudflare#1318.
 */
const ORIGINALS = Symbol.for("next.fast-set-immediate.originals");
const MAX_CHAINED = 10_000;

if (!globalThis[ORIGINALS] && typeof globalThis.setImmediate === "function") {
  const nativeSetImmediate = globalThis.setImmediate;
  const nativeClearImmediate = globalThis.clearImmediate;
  let chained = 0;

  class FastImmediate {
    cancelled = false;
    ref() {
      return this;
    }
    unref() {
      return this;
    }
    hasRef() {
      return true;
    }
  }

  const setFastImmediate = (callback, ...args) => {
    if (++chained > MAX_CHAINED) {
      chained = 0;
      return nativeSetImmediate(callback, ...args);
    }
    const handle = new FastImmediate();
    queueMicrotask(() => {
      if (!handle.cancelled) callback(...args);
    });
    return handle;
  };

  const clearFastImmediate = (handle) => {
    if (handle instanceof FastImmediate) handle.cancelled = true;
    else nativeClearImmediate(handle);
  };

  globalThis[ORIGINALS] = {
    setImmediate: setFastImmediate,
    clearImmediate: clearFastImmediate,
    nextTick: process.nextTick,
  };
}
