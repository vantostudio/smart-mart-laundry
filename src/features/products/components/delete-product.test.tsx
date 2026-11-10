import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { DeleteProduct } from "./delete-product";

const mocks = vi.hoisted(() => ({
  push: vi.fn<(href: string) => void>(),
  refresh: vi.fn<() => void>(),
  deleteProduct: vi.fn<(id: string) => Promise<unknown>>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("../lib/api-client", async (original) => ({
  ...(await original<typeof import("../lib/api-client")>()),
  deleteProduct: mocks.deleteProduct,
}));

async function openDialog() {
  const user = userEvent.setup();
  render(<DeleteProduct id="p1" name="Linen dress" />);
  await user.click(screen.getByRole("button", { name: "Delete product" }));
  return user;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.deleteProduct.mockResolvedValue({ ok: true, data: undefined });
});

describe("DeleteProduct", () => {
  it("asks first, naming the product", async () => {
    await openDialog();
    expect(screen.getByRole("alertdialog", { name: "Delete Linen dress?" })).toBeInTheDocument();
    expect(mocks.deleteProduct).not.toHaveBeenCalled();
  });

  it("does nothing on Cancel", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(mocks.deleteProduct).not.toHaveBeenCalled();
  });

  it("deletes on confirm and goes back to the list", async () => {
    const user = await openDialog();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(mocks.deleteProduct).toHaveBeenCalledWith("p1");
    expect(mocks.push).toHaveBeenCalledWith("/admin/products");
  });

  it("stays open with the message when it fails", async () => {
    mocks.deleteProduct.mockResolvedValue({
      ok: false,
      error: { code: "NOT_FOUND", message: "That product doesn't exist.", requestId: "r" },
    });
    const user = await openDialog();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("That product doesn't exist.");
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
