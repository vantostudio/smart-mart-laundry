import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vite-plus/test";

import {
  BAG_STORAGE_KEY,
  BagProvider,
  CART_STORAGE_KEY,
  CartProvider,
} from "@/features/cart/cart-provider";

import { SiteHeader } from "./site-header";

vi.mock("next/navigation", () => ({ usePathname: () => "/laundry" }));

function renderHeader() {
  return render(
    <CartProvider>
      <BagProvider>
        <SiteHeader />
      </BagProvider>
    </CartProvider>,
  );
}

describe("SiteHeader", () => {
  it("shows both main links and marks the current page", () => {
    renderHeader();
    const main = screen.getByRole("navigation", { name: "Main" });
    const laundry = screen.getByRole("link", { name: "Laundry" });
    const shop = screen.getByRole("link", { name: "Shop" });

    expect(main).toContainElement(laundry);
    expect(main).toContainElement(shop);
    expect(laundry).toHaveAttribute("aria-current", "page");
    expect(shop).not.toHaveAttribute("aria-current");
  });

  it("has no menu button", () => {
    renderHeader();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("links the booking button to the laundry page", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: "Book pickup" })).toHaveAttribute("href", "/laundry");
  });

  it("hides the cart while it is empty", () => {
    renderHeader();
    expect(screen.queryByRole("link", { name: /cart/i })).not.toBeInTheDocument();
  });

  it("shows the cart with its item count once items are stored", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { id: "shirt", name: "Shirt", price: 50, qty: 2 },
        { id: "duvet", name: "Duvet", price: 400, qty: 1 },
      ]),
    );
    renderHeader();

    const cart = await screen.findByRole("link", { name: "Laundry cart, 3 items" });
    expect(cart).toHaveAttribute("href", "/laundry#cart");
    expect(cart).toHaveTextContent("3");
  });

  it("shows the shop bag separately, linking to the bag on /shop", async () => {
    localStorage.setItem(
      BAG_STORAGE_KEY,
      JSON.stringify([{ id: "SM-1001:M", name: "Denim jacket", price: 1200, qty: 1, max: 1 }]),
    );
    renderHeader();

    const bag = await screen.findByRole("link", { name: "Shop bag, 1 item" });
    expect(bag).toHaveAttribute("href", "/shop#bag");
    expect(screen.queryByRole("link", { name: /Laundry cart/ })).not.toBeInTheDocument();
  });
});
