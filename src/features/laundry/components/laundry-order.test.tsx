import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { CartProvider } from "@/features/cart/cart-provider";
import { SAVED_AREA_KEY } from "@/lib/saved-details";

import { LaundryOrder } from "./laundry-order";

beforeEach(() => {
  // Wednesday 28 Oct 2026, 9 AM: today can still be booked.
  vi.useFakeTimers({ now: new Date(2026, 9, 28, 9, 0), toFake: ["Date"] });
  window.HTMLElement.prototype.scrollIntoView = () => {};
});

afterEach(() => {
  vi.useRealTimers();
});

const renderOrder = (query = "") =>
  render(
    <CartProvider>
      <LaundryOrder params={new URLSearchParams(query)} />
    </CartProvider>,
  );

const sentText = (sheet: HTMLElement) =>
  decodeURIComponent(
    within(sheet).getByRole("link", { name: "Send order on WhatsApp" }).getAttribute("href") ?? "",
  );

describe("LaundryOrder", () => {
  it("shows every category as picture cards, or one from the URL", () => {
    renderOrder("cat=carpets");
    expect(screen.getByRole("heading", { name: "Carpets" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Baskets" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Large carpet" })).toBeInTheDocument();
  });

  it("books with taps only: items, two days and an area", async () => {
    const user = userEvent.setup();
    renderOrder();
    await user.click(screen.getByRole("button", { name: "Add Small basket" }));
    await user.click(screen.getByRole("button", { name: "Add one Small basket" }));
    await user.click(screen.getByRole("button", { name: /Book pickup/ }));

    const sheet = screen.getByRole("dialog", { name: "Book pickup" });
    expect(within(sheet).getByRole("button", { name: /Pick a collection day/ })).toBeVisible();
    // Past days can't be picked; today can.
    expect(within(sheet).getByRole("button", { name: "Tuesday 27 October" })).toBeDisabled();
    await user.click(within(sheet).getByRole("button", { name: "Thursday 29 October" }));

    // The return is suggested as the next day.
    expect(within(sheet).getByRole("button", { name: "Friday 30 October" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(within(sheet).getByRole("button", { name: /Choose your area/ }));
    await user.click(within(sheet).getByRole("radio", { name: "Ndagani" }));

    const message = sentText(sheet);
    expect(message).toContain("2 × Small basket — KSh 300");
    expect(message).toContain("Collection: Thu 29 Oct");
    expect(message).toContain("Return: Fri 30 Oct");
    expect(message).toContain("Area: Ndagani");
    expect(within(sheet).queryByRole("textbox")).not.toBeInTheDocument();

    // Sending remembers the area for next time.
    await user.click(within(sheet).getByRole("link", { name: "Send order on WhatsApp" }));
    expect(localStorage.getItem(SAVED_AREA_KEY)).toBe("Ndagani");
    expect(within(sheet).getByText("Your order is ready in WhatsApp")).toBeInTheDocument();
  });

  it("returns within a week only, and notes a same-day return", async () => {
    const user = userEvent.setup();
    renderOrder("pickup=2026-10-29");
    await user.click(screen.getByRole("button", { name: "Add Door mat" }));
    await user.click(screen.getByRole("button", { name: /Book pickup/ }));
    const sheet = screen.getByRole("dialog", { name: "Book pickup" });

    await user.click(within(sheet).getByRole("radio", { name: /Return/ }));
    expect(within(sheet).getByRole("button", { name: "Friday 6 November" })).toBeDisabled();
    await user.click(within(sheet).getByRole("button", { name: "Thursday 29 October" }));
    expect(within(sheet).getByText(/Same day needs a morning collection/)).toBeInTheDocument();
  });

  it("adds a note only when asked", async () => {
    const user = userEvent.setup();
    renderOrder();
    await user.click(screen.getByRole("button", { name: "Add Door mat" }));
    await user.click(screen.getByRole("button", { name: /Book pickup/ }));
    const sheet = screen.getByRole("dialog", { name: "Book pickup" });
    await user.click(within(sheet).getByRole("button", { name: /Add a note/ }));
    await user.type(within(sheet).getByRole("textbox", { name: /Note/ }), "Hostel B, room 12");
    await user.click(within(sheet).getByRole("button", { name: "Thursday 29 October" }));
    await user.click(within(sheet).getByRole("radio", { name: "Chuka town" }));
    expect(sentText(sheet)).toContain("Note: Hostel B, room 12");
  });
});
