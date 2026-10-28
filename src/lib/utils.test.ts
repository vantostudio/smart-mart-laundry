import { describe, expect, it } from "vite-plus/test";

import { cn } from "./utils";

describe("cn", () => {
  it("keeps a design-system font size next to a text colour", () => {
    expect(cn("text-title text-primary")).toBe("text-title text-primary");
  });

  it("lets a later font size win over an earlier one", () => {
    expect(cn("text-body-sm", "text-display-lg")).toBe("text-display-lg");
  });

  it("keeps a gradient next to a background colour", () => {
    expect(cn("bg-primary", "bg-mesh")).toBe("bg-primary bg-mesh");
  });

  it("still resolves ordinary Tailwind conflicts", () => {
    expect(cn("px-4 shadow-card", "px-6 shadow-lift")).toBe("px-6 shadow-lift");
  });
});
