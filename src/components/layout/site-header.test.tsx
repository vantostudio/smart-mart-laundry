import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("lists every page in the desktop nav and marks the current one", () => {
    renderHeader();
    const main = screen.getByRole("navigation", { name: "Main" });
    const laundry = within(main).getByRole("link", { name: "Laundry" });

    expect(
      within(main)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["Laundry", "Shop", "About"]);
    expect(laundry).toHaveAttribute("aria-current", "page");
    expect(within(main).getByRole("link", { name: "Shop" })).not.toHaveAttribute("aria-current");
  });

  it("opens a menu with every page, contact and booking", async () => {
    renderHeader();
    await userEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const menu = screen.getByRole("dialog", { name: "Menu" });

    expect(within(menu).getByRole("link", { name: /Laundry & prices/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(menu).getByRole("link", { name: /Shop clothes & shoes/ })).toHaveAttribute(
      "href",
      "/shop",
    );
    expect(within(menu).getByRole("link", { name: /About us/ })).toHaveAttribute("href", "/about");
    expect(within(menu).getByRole("link", { name: /Call/ })).toHaveAttribute(
      "href",
      expect.stringMatching(/^tel:/),
    );
    expect(within(menu).getByRole("link", { name: "Book a pickup" })).toHaveAttribute(
      "href",
      "/laundry",
    );
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

  it("shows only the shop bag when the laundry cart is empty", async () => {
    localStorage.setItem(
      BAG_STORAGE_KEY,
      JSON.stringify([{ id: "SM-1001:M", name: "Denim jacket", price: 1200, qty: 1, max: 1 }]),
    );
    renderHeader();

    const bag = await screen.findByRole("link", { name: "Shop bag, 1 item" });
    expect(bag).toHaveAttribute("href", "/shop#bag");
    expect(screen.queryByRole("link", { name: /Laundry cart/ })).not.toBeInTheDocument();
  });

  it("merges both carts into one button that lets you pick an order", async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ id: "basket-small", name: "Small basket", price: 150, qty: 2 }]),
    );
    localStorage.setItem(
      BAG_STORAGE_KEY,
      JSON.stringify([{ id: "SM-1001:M", name: "Denim jacket", price: 1200, qty: 1, max: 1 }]),
    );
    renderHeader();

    await userEvent.click(await screen.findByRole("button", { name: "Your orders, 3 items" }));
    const orders = screen.getByRole("dialog", { name: "Your orders" });
    expect(within(orders).getByRole("link", { name: /Laundry pickup/ })).toHaveAttribute(
      "href",
      "/laundry#cart",
    );
    expect(within(orders).getByRole("link", { name: /Shop bag/ })).toHaveAttribute(
      "href",
      "/shop#bag",
    );
  });
});
