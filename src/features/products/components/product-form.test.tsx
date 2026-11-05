import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { Product } from "../lib/products";
import { ProductForm } from "./product-form";

const mocks = vi.hoisted(() => ({
  push: vi.fn<(href: string) => void>(),
  refresh: vi.fn<() => void>(),
  saveProduct: vi.fn<(id: string | undefined, draft: unknown) => Promise<unknown>>(),
  uploadPhoto: vi.fn<(photo: Blob) => Promise<unknown>>(),
  shrinkImage: vi.fn<(file: File) => Promise<Blob>>(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));
vi.mock("../lib/shrink-image", () => ({ shrinkImage: mocks.shrinkImage }));
vi.mock("../lib/api-client", async (original) => ({
  ...(await original<typeof import("../lib/api-client")>()),
  saveProduct: mocks.saveProduct,
  uploadPhoto: mocks.uploadPhoto,
}));

const product: Product = {
  id: "p1",
  code: "SM-1001",
  name: "Linen dress",
  category: "ladies",
  condition: "mtumba",
  price: 800,
  sizes: ["S", "M"],
  stock: 2,
  images: ["products/a.webp"],
  note: "Small mark",
  createdAt: "2026-11-05T00:00:00.000Z",
};
const photos = [{ key: "products/a.webp", url: "https://photos.test/a.webp" }];

const save = () => screen.getByRole("button", { name: "Save product" });

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Sneakers");
  await user.click(screen.getByRole("radio", { name: "New" }));
  await user.click(screen.getByRole("radio", { name: "Shoes" }));
  await user.type(screen.getByLabelText("Price (KSh)"), "3200");
  await user.type(screen.getByLabelText("Stock"), "4");
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.saveProduct.mockResolvedValue({ ok: true, data: product });
  mocks.shrinkImage.mockResolvedValue(new Blob(["x"]));
});

describe("ProductForm", () => {
  it("adds a product and goes back to the list", async () => {
    const user = userEvent.setup();
    render(<ProductForm />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: "41" }));
    await user.click(screen.getByRole("button", { name: "40" }));
    await user.click(save());

    expect(mocks.saveProduct).toHaveBeenCalledWith(undefined, {
      name: "Sneakers",
      category: "shoes",
      condition: "new",
      price: 3200,
      stock: 4,
      sizes: ["40", "41"],
      images: [],
      note: null,
    });
    expect(mocks.push).toHaveBeenCalledWith("/admin/products");
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it("starts from the product when editing, and saves to it", async () => {
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    expect(screen.getByRole("button", { name: "M", pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "L", pressed: false })).toBeInTheDocument();

    await user.clear(screen.getByLabelText("Price (KSh)"));
    await user.type(screen.getByLabelText("Price (KSh)"), "650");
    await user.click(save());

    expect(mocks.saveProduct).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ price: 650, images: ["products/a.webp"], note: "Small mark" }),
    );
  });

  it("offers no sizes until there's a category, and nowhere to type one", async () => {
    render(<ProductForm />);
    expect(screen.getByText("Choose a category first to see its sizes.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Sizes")).not.toBeInTheDocument();
  });

  it("offers the sizes of the category", async () => {
    const user = userEvent.setup();
    render(<ProductForm />);
    await user.click(screen.getByRole("radio", { name: "Shoes" }));
    expect(screen.getByRole("button", { name: "42" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "M" })).not.toBeInTheDocument();
  });

  it("keeps sizes the new category also has", async () => {
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(screen.getByRole("radio", { name: "Men's wear" }));
    await user.click(save());
    expect(mocks.saveProduct).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ category: "men", sizes: ["S", "M"] }),
    );
  });

  it("drops sizes the new category doesn't have", async () => {
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(screen.getByRole("radio", { name: "Shoes" }));
    await user.click(save());
    expect(mocks.saveProduct).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ category: "shoes", sizes: [] }),
    );
  });

  it("can untick a size", async () => {
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(screen.getByRole("button", { name: "S" }));
    await user.click(save());
    expect(mocks.saveProduct).toHaveBeenCalledWith("p1", expect.objectContaining({ sizes: ["M"] }));
  });

  it("asks for a category and condition without calling the API", async () => {
    const user = userEvent.setup();
    render(<ProductForm />);
    await user.type(screen.getByLabelText("Name"), "Sneakers");
    await user.type(screen.getByLabelText("Price (KSh)"), "1");
    await user.type(screen.getByLabelText("Stock"), "1");
    await user.click(save());

    expect(await screen.findByRole("alert")).toHaveTextContent("Choose a category.");
    expect(mocks.saveProduct).not.toHaveBeenCalled();
  });

  it("shows the API's error on the field it names, and can try again", async () => {
    mocks.saveProduct.mockResolvedValue({
      ok: false,
      error: { code: "VALIDATION", message: "Check this", field: "price", requestId: "r" },
    });
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(save());

    expect(await screen.findByRole("alert")).toHaveTextContent("Check this");
    expect(screen.getByLabelText("Price (KSh)")).toHaveAttribute("aria-invalid", "true");
    expect(mocks.push).not.toHaveBeenCalled();
    expect(save()).toBeEnabled();
  });

  it("takes people to the field that needs fixing", async () => {
    mocks.saveProduct.mockResolvedValue({
      ok: false,
      error: { code: "VALIDATION", message: "Check this", field: "name", requestId: "r" },
    });
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(save());
    await screen.findByRole("alert");
    expect(screen.getByLabelText("Name")).toHaveFocus();
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription("Check this");
  });

  it("takes people to the category when none is chosen", async () => {
    const user = userEvent.setup();
    render(<ProductForm />);
    await user.type(screen.getByLabelText("Name"), "Sneakers");
    await user.click(screen.getByRole("radio", { name: "New" }));
    await user.type(screen.getByLabelText("Price (KSh)"), "1");
    await user.type(screen.getByLabelText("Stock"), "1");
    await user.click(save());
    expect(await screen.findByRole("alert")).toHaveTextContent("Choose a category.");
    expect(screen.getByRole("radio", { name: "Ladies wear" })).toHaveFocus();
  });

  it("offers sign-in in a new tab when the session has ended, keeping the form", async () => {
    mocks.saveProduct.mockResolvedValue({
      ok: false,
      error: { code: "UNAUTHENTICATED", message: "Please sign in.", requestId: "r" },
    });
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(save());
    const link = await screen.findByRole("link", { name: "Sign in again" });
    expect(link).toHaveAttribute("href", "/admin/sign-in");
    expect(link).toHaveAttribute("target", "_blank");
    expect(screen.getByLabelText("Name")).toHaveValue("Linen dress");
    expect(save()).toBeEnabled();
  });

  it("shows a failure with no field, with the code to quote", async () => {
    mocks.saveProduct.mockResolvedValue({
      ok: false,
      error: { code: "INTERNAL", message: "Internal error", requestId: "abc" },
    });
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(save());
    expect(await screen.findByRole("alert")).toHaveTextContent("abc");
  });

  it("uploads picked photos and saves their keys", async () => {
    mocks.uploadPhoto.mockResolvedValue({
      ok: true,
      data: { key: "products/b.webp", url: "https://photos.test/b.webp" },
    });
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.upload(
      screen.getByLabelText("Add photos"),
      new File(["x"], "b.jpg", { type: "image/jpeg" }),
    );

    expect(await screen.findByAltText("Photo 2")).toBeInTheDocument();
    await user.click(save());
    expect(mocks.saveProduct).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ images: ["products/a.webp", "products/b.webp"] }),
    );
  });

  it("can't save while a photo is uploading", async () => {
    let finish: (value: unknown) => void = () => {};
    mocks.uploadPhoto.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.upload(
      screen.getByLabelText("Add photos"),
      new File(["x"], "b.jpg", { type: "image/jpeg" }),
    );

    await waitFor(() => expect(save()).toBeDisabled());
    expect(screen.getByText("Adding photo 1 of 1…")).toBeInTheDocument();
    finish({ ok: true, data: { key: "products/b.webp", url: "https://photos.test/b.webp" } });
    await waitFor(() => expect(save()).toBeEnabled());
  });

  it("says when a photo can't be read, and keeps the rest", async () => {
    mocks.shrinkImage.mockRejectedValue(new Error("HEIC"));
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.upload(
      screen.getByLabelText("Add photos"),
      new File(["x"], "b.heic", { type: "image/jpeg" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("couldn't be read");
    expect(screen.getByAltText("Photo 1")).toBeInTheDocument();
    expect(mocks.uploadPhoto).not.toHaveBeenCalled();
  });

  it("removes a photo from what gets saved", async () => {
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    await user.click(screen.getByRole("button", { name: "Remove photo 1" }));
    expect(screen.getByRole("button", { name: "Add photos" })).toHaveFocus();
    await user.click(save());
    expect(mocks.saveProduct).toHaveBeenCalledWith("p1", expect.objectContaining({ images: [] }));
  });

  it("takes only as many photos as there's room for", async () => {
    mocks.uploadPhoto.mockImplementation(async () => ({
      ok: true,
      data: { key: `products/${crypto.randomUUID()}.webp`, url: "https://photos.test/n.webp" },
    }));
    const user = userEvent.setup();
    render(<ProductForm product={product} photos={photos} />);
    const files = Array.from(
      { length: 7 },
      (_, i) => new File(["x"], `${i}.jpg`, { type: "image/jpeg" }),
    );
    await user.upload(screen.getByLabelText("Add photos"), files);

    await waitFor(() => expect(mocks.uploadPhoto).toHaveBeenCalledTimes(5));
    expect(await screen.findByRole("alert")).toHaveTextContent("up to 6 photos");
  });
});
