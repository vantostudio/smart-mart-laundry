import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vite-plus/test";

import { CartProvider } from "@/features/cart/cart-provider";

import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/laundry" }));

function renderHeader() {
  return render(
    <CartProvider>
      <SiteHeader />
    </CartProvider>,
  );
}

describe("SiteHeader", () => {
  it("marks the current page in the main navigation", () => {
    renderHeader();
    const main = screen.getByRole("navigation", { name: "Main" });
    const current = main.querySelector('[aria-current="page"]');
    expect(current).toHaveTextContent("Laundry");
  });

  it("toggles the mobile menu", async () => {
    renderHeader();
    const toggle = screen.getByRole("button", { name: "Open menu" });

    await userEvent.click(toggle);
    expect(screen.getByRole("navigation", { name: "Mobile" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Close menu" }));
    expect(screen.queryByRole("navigation", { name: "Mobile" })).not.toBeInTheDocument();
  });
});
