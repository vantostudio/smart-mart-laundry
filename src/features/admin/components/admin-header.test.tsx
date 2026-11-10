import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { AdminContext } from "@/features/admin/lib/auth";
import { signInMessages } from "@/features/admin/messages";

import { AdminHeader } from "./admin-header";

const mocks = vi.hoisted(() => ({
  signOut: vi.fn<() => Promise<{ error: unknown }>>(),
  navigateTo: vi.fn<(path: string) => void>(),
}));

vi.mock("@neon/auth/next", () => ({ createAuthClient: () => ({ signOut: mocks.signOut }) }));
vi.mock("@/features/admin/lib/navigate", () => ({ navigateTo: mocks.navigateTo }));

const owner: AdminContext = {
  adminId: "a1",
  email: "mo@example.com",
  name: "Mo Kamau",
  role: "owner",
};
const admin: AdminContext = { ...owner, adminId: "a2", role: "admin" };

const signOutButton = () => screen.getByRole("button", { name: /Sign(ing)? out/ });

beforeEach(() => {
  mocks.signOut.mockReset().mockResolvedValue({ error: null });
  mocks.navigateTo.mockReset();
});

describe("AdminHeader", () => {
  it("links every admin to Products", () => {
    render(<AdminHeader admin={admin} />);
    expect(screen.getByRole("link", { name: "Products" })).toHaveAttribute(
      "href",
      "/admin/products",
    );
  });

  it("links every admin to Settings, and no longer to a Team page", () => {
    render(<AdminHeader admin={owner} />);
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/admin/settings",
    );
    expect(screen.queryByRole("link", { name: "Team" })).toBeNull();
  });

  it("shows a name and role", () => {
    render(<AdminHeader admin={owner} />);
    expect(screen.getByText(/Mo Kamau/)).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Street Mart home" })).toBeInTheDocument();
  });

  it("never shows an email, with a name or without one", () => {
    const { container, rerender } = render(<AdminHeader admin={owner} />);
    expect(container.textContent).not.toContain("@");

    rerender(<AdminHeader admin={{ ...admin, name: null }} />);
    expect(container.textContent).not.toContain("@");
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("signs out, stays busy and goes to sign-in", async () => {
    let resolve!: (value: { error: unknown }) => void;
    mocks.signOut.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<AdminHeader admin={admin} />);
    await userEvent.click(signOutButton());

    expect(signOutButton()).toHaveTextContent("Signing out…");
    expect(signOutButton()).toBeDisabled();
    expect(signOutButton()).toHaveAttribute("aria-busy", "true");

    resolve({ error: null });
    await vi.waitFor(() => expect(mocks.navigateTo).toHaveBeenCalledWith("/admin/sign-in"));
    expect(signOutButton()).toBeDisabled();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it.each([
    ["rejects", () => mocks.signOut.mockRejectedValue(new Error("network down"))],
    ["resolves with an error", () => mocks.signOut.mockResolvedValue({ error: { status: 500 } })],
  ])("shows the failure and re-enables the button when sign-out %s", async (_, setup) => {
    setup();
    render(<AdminHeader admin={admin} />);
    await userEvent.click(signOutButton());

    expect(await screen.findByRole("alert")).toHaveTextContent(signInMessages.signOutFailed);
    expect(signOutButton()).toBeEnabled();
    expect(signOutButton()).toHaveTextContent("Sign out");
    expect(mocks.navigateTo).not.toHaveBeenCalled();
    expect(screen.queryByText(/network down/)).toBeNull();
  });
});
