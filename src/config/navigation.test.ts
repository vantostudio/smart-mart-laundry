import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { siteNav } from "./navigation";

// Every nav link must resolve to a page inside the (site) route group.
const siteDir = join(process.cwd(), "src", "app", "(site)");

describe("navigation", () => {
  it.each(siteNav.map((l) => l.href))("%s has a page.tsx", (href) => {
    expect(existsSync(join(siteDir, href, "page.tsx"))).toBe(true);
  });
});
