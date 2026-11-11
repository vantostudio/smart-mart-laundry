// The Worker's entry: load the timer shim before Next.js, then hand everything to OpenNext.
import "./next-immediates.mjs";

export { default } from "../.open-next/worker.js";
export * from "../.open-next/worker.js";
