import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

import type { AdminContext } from "@/features/admin/lib/auth";
import { errorMessages } from "@/features/admin/messages";
import { AppError } from "@/lib/errors";

import { SignInPanel } from "./sign-in-panel";

const mocks = vi.hoisted(() => ({
  getAdmin: vi.fn<() => Promise<AdminContext | null>>(),
  getAuthClient: vi.fn<() => Promise<{ signOut: () => Promise<unknown> }>>(),
  signOut: vi.fn<() => Promise<unknown>>(),
}));

/** What the mocked `redirect()` throws, as the real one does. */
class Redirected extends Error {
  constructor(readonly url: string) {
    super(`redirect ${url}`);
  }
}

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Redirected(url);
  },
  unstable_rethrow: (err: unknown) => {
    if (err instanceof Redirected) throw err;
  },
}));
vi.mock("@/features/admin/lib/auth", () => ({ getAdmin: mocks.getAdmin }));
vi.mock("@/features/admin/lib/auth-client", () => ({
  getAuthClient: mocks.getAuthClient,
  failureStatus: () => null,
}));

const owner: AdminContext = { adminId: "a1", email: "o@b.c", name: "Owner", role: "owner" };

const renderPanel = async (reason?: string) =>
  render(await SignInPanel({ searchParams: Promise.resolve({ reason }) }));

beforeEach(() => {
  mocks.getAdmin.mockReset().mockResolvedValue(null);
  mocks.signOut.mockReset().mockResolvedValue({ error: null });
  mocks.getAuthClient.mockReset().mockResolvedValue({ signOut: mocks.signOut });
});

describe("SignInPanel", () => {
  it("clears a refused session when auth is up", async () => {
    await renderPanel("FORBIDDEN");

    expect(screen.getByRole("alert")).toHaveTextContent(errorMessages.FORBIDDEN);
    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
  });

  // Mid-outage nobody can be told apart, so a crafted ?reason=FORBIDDEN could hit a real admin.
  it("signs nobody out while auth is unavailable", async () => {
    mocks.getAdmin.mockRejectedValue(new AppError("AUTH_UNAVAILABLE", "down"));
    await renderPanel("FORBIDDEN");

    expect(screen.getByRole("alert")).toHaveTextContent(errorMessages.FORBIDDEN);
    expect(mocks.getAuthClient).not.toHaveBeenCalled();
  });

  it("shows the outage and signs nobody out with no reason", async () => {
    mocks.getAdmin.mockRejectedValue(new AppError("AUTH_UNAVAILABLE", "down"));
    await renderPanel();

    expect(screen.getByRole("alert")).toHaveTextContent(errorMessages.AUTH_UNAVAILABLE);
    expect(mocks.getAuthClient).not.toHaveBeenCalled();
  });

  it("sends a signed-in admin to /admin, even with a crafted reason", async () => {
    mocks.getAdmin.mockResolvedValue(owner);

    await expect(renderPanel("FORBIDDEN")).rejects.toThrow("redirect /admin");
    expect(mocks.getAuthClient).not.toHaveBeenCalled();
  });
});
