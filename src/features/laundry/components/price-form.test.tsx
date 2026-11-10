import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { laundryMessages, settingsMessages } from "@/features/admin/messages";

import { itemsIn } from "../data";
import { PriceForm } from "./price-form";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  refresh.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

const mats = (canEdit = true) => (
  <PriceForm
    category="mats"
    heading="Mats"
    note="Scrubbed and dried"
    items={itemsIn("mats")}
    canEdit={canEdit}
  />
);

describe("PriceForm", () => {
  it("shows each item's price and sends the whole group", async () => {
    fetchMock.mockResolvedValue(Response.json({}));
    render(mats());
    const door = screen.getByLabelText("Door mat");
    expect(door).toHaveValue("50");

    await userEvent.clear(door);
    await userEvent.type(door, "75");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await screen.findByText(settingsMessages.savedForShop);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/admin/laundry-prices");
    expect(JSON.parse(String(init?.body))).toEqual({
      "mat-door": 75,
      "mat-fluffy": 200,
      "mat-floor": 350,
    });
    expect(refresh).toHaveBeenCalled();
  });

  it("puts a refused price on its field and focuses it", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        {
          error: {
            code: "VALIDATION",
            message: "Check this.",
            field: "mat-fluffy",
            requestId: "r",
          },
        },
        { status: 400 },
      ),
    );
    render(mats());
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByLabelText("Fluffy mat")).toHaveFocus());
    expect(screen.getByRole("alert")).toHaveTextContent("Check this.");
  });

  it("is read-only for staff who aren't the owner", () => {
    render(mats(false));
    expect(screen.getByLabelText("Door mat")).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    expect(screen.queryByRole("link", { name: laundryMessages.addItem("Mats") })).toBeNull();
    expect(screen.queryByRole("link", { name: laundryMessages.editItem("Door mat") })).toBeNull();
  });

  it("links to each item and to adding one in this group", () => {
    render(mats());
    expect(
      screen.getByRole("link", { name: laundryMessages.editItem("Door mat") }),
    ).toHaveAttribute("href", "/admin/laundry/mat-door/edit");
    expect(screen.getByRole("link", { name: laundryMessages.addItem("Mats") })).toHaveAttribute(
      "href",
      "/admin/laundry/new?category=mats",
    );
  });

  it("shows a price changed on the item's own page, which came back from the server", () => {
    const { rerender } = render(mats());
    const changed = itemsIn("mats").map((i) => (i.id === "mat-door" ? { ...i, price: 90 } : i));
    rerender(<PriceForm category="mats" heading="Mats" note="" items={changed} canEdit />);
    expect(screen.getByLabelText("Door mat")).toHaveValue("90");
  });
});
