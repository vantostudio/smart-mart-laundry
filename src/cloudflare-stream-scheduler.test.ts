import { describe, expect, it } from "vite-plus/test";

import { patchStreamScheduler } from "../cloudflare/patch-stream-scheduler.mjs";

// The shapes Next's scheduler takes in the Worker bundle (esbuild `keepNames`), and in Next's own
// minified runtime.
const bundled =
  'scheduleImmediate=__name(cb=>{setImmediate(cb)},"scheduleImmediate");function atLeastOneTask(){return new Promise(resolve=>scheduleImmediate(resolve))}';
const renamed =
  'g2=__name(a2=>{setImmediate(a2)},"g");function h2(){return new Promise(a2=>g2(a2))}__name(h2,"h");function i2(){return new Promise(a2=>setImmediate(a2))}';
const minified = "a=e=>{setImmediate(e)};function i(){return new Promise(e=>a(e))}";

describe("patchStreamScheduler", () => {
  it("makes the stream scheduler wait a real task, in every shape", () => {
    const { code, count } = patchStreamScheduler([bundled, renamed, minified].join("\n"));
    expect(count).toBe(3);
    expect(code).toContain('scheduleImmediate=__name(cb=>{setTimeout(cb,0)},"scheduleImmediate")');
    expect(code).toContain('g2=__name(a2=>{setTimeout(a2,0)},"g")');
    expect(code).toContain("a=e=>{setTimeout(e,0)};function i()");
  });

  it("leaves React's render wait and other setImmediate calls alone", () => {
    const { code } = patchStreamScheduler(renamed + "\nsetImmediate(function(){return aj(e)})");
    expect(code).toContain("function i2(){return new Promise(a2=>setImmediate(a2))}");
    expect(code).toContain("setImmediate(function(){return aj(e)})");
  });

  it("finds nothing in code without the scheduler", () => {
    expect(patchStreamScheduler("a=e=>{setImmediate(e)};").count).toBe(0);
  });
});
