import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { laundryMessages as m } from "@/features/admin/messages";

import { ItemForm } from "./item-form";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  push.mockReset();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

const item = {
  id: "mat-door",
  name: "Door mat",
  desc: "Scrubbed.",
  price: 50,
  mark: null,
  photo: { key: "photo-1-ab", url: "https://images.test/a.jpg" },
};

const refused = (field: string, message: string) =>
  Response.json({ error: { code: "VALIDATION", message, field, requestId: "r" } }, { status: 400 });

describe("ItemForm", () => {
  it("saves changes and goes back to the list", async () => {
    fetchMock.mockResolvedValue(Response.json({}));
    render(<ItemForm item={item} />);
    const name = screen.getByLabelText(m.name);
    await userEvent.clear(name);
    await userEvent.type(name, "Big mat");
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/laundry"));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("/api/admin/laundry-items/mat-door");
    expect(JSON.parse(String(init?.body))).toEqual({
      name: "Big mat",
      desc: "Scrubbed.",
      price: 50,
      mark: null,
      image: "photo-1-ab",
    });
  });

  it("offers the group only when adding, starting on the one chosen", () => {
    const { rerender } = render(<ItemForm category="mats" />);
    expect(screen.getByRole("radio", { name: "Mats" })).toBeChecked();
    rerender(<ItemForm item={item} />);
    expect(screen.queryByRole("radio", { name: "Mats" })).toBeNull();
  });

  it("shows a refusal on its field and stays on the page", async () => {
    fetchMock.mockResolvedValue(refused("desc", m.fields.desc));
    render(<ItemForm item={item} />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByLabelText(m.description)).toHaveFocus());
    expect(screen.getByRole("alert")).toHaveTextContent(m.fields.desc);
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a refusal about the photo", async () => {
    fetchMock.mockResolvedValue(refused("image", m.fields.image));
    render(<ItemForm category="mats" />);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText(m.fields.image)).toBeInTheDocument();
  });
});
