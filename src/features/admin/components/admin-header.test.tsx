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
  it("shows an owner their name, role and the Team link", () => {
    render(<AdminHeader admin={owner} />);
    expect(screen.getByText("Mo Kamau")).toBeInTheDocument();
    expect(screen.getByText(/Owner/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Team" })).toHaveAttribute("href", "/admin/team");
    expect(screen.getByRole("link", { name: "Street Mart home" })).toBeInTheDocument();
  });

  it("shows an admin their role and no Team link", () => {
    render(<AdminHeader admin={admin} />);
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
    expect(screen.queryByText(/Owner/)).toBeNull();
    expect(screen.queryByRole("link", { name: "Team" })).toBeNull();
  });

  it("falls back to the email when there is no name", () => {
    render(<AdminHeader admin={{ ...admin, name: null }} />);
    expect(screen.getByText("mo@example.com")).toBeInTheDocument();
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
