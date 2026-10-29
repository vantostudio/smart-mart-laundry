import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { CartProvider } from "@/features/cart/cart-provider";
import { SAVED_DETAILS_KEY } from "@/lib/saved-details";

import { LaundryOrder } from "./laundry-order";

const replace = vi.fn<(href: string, options?: { scroll?: boolean }) => void>();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  // Wednesday 28 Oct 2026, 8:00 AM: today's morning window has already closed.
  vi.useFakeTimers({ now: new Date(2026, 9, 28, 8, 0), toFake: ["Date"] });
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  replace.mockClear();
});

const renderOrder = (query = "") =>
  render(
    <CartProvider>
      <LaundryOrder params={new URLSearchParams(query)} />
    </CartProvider>,
  );

const sendLink = () => screen.getByRole("link", { name: "Send order on WhatsApp" });
const sentText = () => decodeURIComponent(sendLink().getAttribute("href") ?? "");

async function fillDetails(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Pickup location"), "Ndagani, blue gate");
  await user.type(screen.getByLabelText("Your name"), "Jane");
  await user.type(screen.getByLabelText("Phone number"), "0712 345 678");
}

describe("LaundryOrder", () => {
  it("shows the three steps and offers only today's open times", () => {
    renderOrder();
    for (const name of [
      /When should we pick up/,
      /What needs washing/,
      /Where should we collect/,
      "Your order",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeInTheDocument();
    }
    const times = screen.getByRole("radiogroup", { name: "Pickup time" });
    expect(within(times).queryByRole("radio", { name: /Morning/ })).not.toBeInTheDocument();
    expect(screen.getByText("Earlier times today have passed.")).toBeInTheDocument();
  });

  it("applies a pickup time as soon as it's tapped", async () => {
    const user = userEvent.setup();
    renderOrder();
    const times = screen.getByRole("radiogroup", { name: "Pickup time" });
    await user.click(within(times).getByRole("radio", { name: /Midday/ }));
    expect(replace).toHaveBeenCalledWith(
      "/laundry?pickup=2026-10-28&window=midday&return=next-day",
      { scroll: false },
    );
    expect(screen.getByText("Wed 28, 10 AM–1 PM")).toBeInTheDocument();
  });

  it("lists what's missing and jumps to it", async () => {
    const user = userEvent.setup();
    renderOrder("pickup=2026-10-29&window=morning&return=next-day");
    expect(screen.queryByRole("button", { name: /pickup day and time/ })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Add at least one basket/ }));
    expect(screen.getByRole("heading", { name: /What needs washing/ })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Add Small basket" }));
    await user.click(sendLink());
    expect(screen.getByText("Tell us where to collect from.", { selector: "p" })).toBeVisible();
    expect(screen.getByLabelText("Pickup location")).toHaveFocus();

    await user.type(screen.getByLabelText("Pickup location"), "Chuka town");
    await user.type(screen.getByLabelText("Your name"), "Jane");
    await user.type(screen.getByLabelText("Phone number"), "12345");
    await user.click(sendLink());
    expect(screen.getByLabelText("Phone number")).toHaveFocus();
    expect(screen.getByText("Use a number like 0712 345 678.", { selector: "p" })).toBeVisible();
  });

  // Types a lot and remounts, so it gets more than the default 5s on a slow machine.
  it("sends notes and the notify choice, then remembers the details", async () => {
    const user = userEvent.setup();
    const { unmount } = renderOrder("pickup=2026-10-29&window=morning&return=next-day");
    await user.click(screen.getByRole("button", { name: "Add Small basket" }));
    await fillDetails(user);
    await user.type(screen.getByLabelText(/Notes for us/), "Coffee stain on the white shirt");
    const notify = screen.getByRole("radiogroup", { name: "How should we tell you it's ready?" });
    await user.click(within(notify).getByRole("radio", { name: "SMS" }));

    expect(sentText()).toContain("1 × Small basket — KSh 150");
    expect(sentText()).toContain("Pickup: Thu 29 Oct, morning (7–10 AM)");
    expect(sentText()).toContain("Notify me by: SMS");
    expect(sentText()).toContain("Notes: Coffee stain on the white shirt");
    expect(screen.queryByText("Still needed")).not.toBeInTheDocument();

    await user.click(sendLink());
    expect(screen.getByText("Your order is ready in WhatsApp")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(SAVED_DETAILS_KEY) ?? "{}")).toEqual({
      location: "Ndagani, blue gate",
      name: "Jane",
      phone: "0712 345 678",
    });

    unmount();
    renderOrder();
    expect(await screen.findByDisplayValue("Ndagani, blue gate")).toBeInTheDocument();
    expect(screen.getByText(/Filled in from your last order/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Not you? Clear" }));
    expect(screen.getByLabelText("Your name")).toHaveValue("");
    expect(localStorage.getItem(SAVED_DETAILS_KEY)).toBeNull();
  }, 15_000);
});
