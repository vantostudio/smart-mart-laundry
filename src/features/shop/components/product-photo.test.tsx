import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it } from "vite-plus/test";

import { ProductPhoto } from "./product-photo";

const thumb = "https://photos.test/a-thumb";
const full = "https://photos.test/a.webp";

const shown = (container: HTMLElement) => container.querySelector("img")!;

describe("ProductPhoto", () => {
  it("shows the thumbnail first", () => {
    const { container } = render(<ProductPhoto src={thumb} fallback={full} sizes="10vw" />);
    expect(shown(container).getAttribute("src")).toContain("a-thumb");
  });

  it("falls back to the full photo once, and stops there if that fails too", () => {
    const { container } = render(<ProductPhoto src={thumb} fallback={full} sizes="10vw" />);
    fireEvent.error(shown(container));
    expect(shown(container).getAttribute("src")).toContain("a.webp");
    fireEvent.error(shown(container));
    expect(shown(container).getAttribute("src")).toContain("a.webp");
  });

  it("has nothing to fall back to without a fallback", () => {
    const { container } = render(<ProductPhoto src={full} sizes="10vw" />);
    fireEvent.error(shown(container));
    expect(shown(container).getAttribute("src")).toContain("a.webp");
  });
});
