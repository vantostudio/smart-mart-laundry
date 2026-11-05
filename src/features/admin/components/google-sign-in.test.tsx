import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";

import { errorMessages, signInMessages } from "@/features/admin/messages";

import { GoogleSignIn } from "./google-sign-in";

const mocks = vi.hoisted(() => ({
  social: vi.fn<(args: unknown) => Promise<{ error: unknown }>>(),
  getSession: vi.fn<() => Promise<{ data: unknown; error: unknown }>>(),
  signOut: vi.fn<() => Promise<{ error: unknown }>>(),
  navigateTo: vi.fn<(path: string) => void>(),
}));

vi.mock("@neon/auth/next", () => ({
  createAuthClient: () => ({
    signIn: { social: mocks.social },
    getSession: mocks.getSession,
    signOut: mocks.signOut,
  }),
}));
vi.mock("@/features/admin/lib/navigate", () => ({ navigateTo: mocks.navigateTo }));

const button = () => screen.getByRole("button");

beforeEach(() => {
  mocks.social.mockReset().mockResolvedValue({ error: null });
  mocks.getSession.mockReset().mockResolvedValue({ data: null, error: null });
  mocks.signOut.mockReset().mockResolvedValue({ error: null });
  mocks.navigateTo.mockReset();
});

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

describe("GoogleSignIn", () => {
  it("opens Google with fixed callback URLs and stays busy", async () => {
    render(<GoogleSignIn message={null} signOutStale={false} />);
    await userEvent.click(button());

    expect(mocks.social).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: `${window.location.origin}/admin/sign-in`,
      errorCallbackURL: `${window.location.origin}/admin/sign-in?reason=SIGN_IN_CANCELLED`,
    });
    expect(button()).toHaveTextContent("Opening Google…");
    expect(button()).toBeDisabled();
    expect(button()).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows the server's message in an alert", () => {
    render(<GoogleSignIn message={errorMessages.FORBIDDEN} signOutStale={false} />);
    expect(screen.getByRole("alert")).toHaveTextContent(errorMessages.FORBIDDEN);
    expect(button()).toHaveTextContent("Continue with Google");
    expect(button()).toBeEnabled();
  });

  it("reads a 503 as unavailable and lets the person try again", async () => {
    mocks.social.mockRejectedValue(Object.assign(new Error("Neon says no"), { status: 503 }));
    render(<GoogleSignIn message={null} signOutStale={false} />);
    await userEvent.click(button());

    expect(await screen.findByRole("alert")).toHaveTextContent(errorMessages.AUTH_UNAVAILABLE);
    expect(button()).toBeEnabled();
    expect(button()).toHaveTextContent("Continue with Google");
    expect(screen.queryByText(/Neon says no/)).toBeNull();
  });

  it("reads a network failure as unavailable", async () => {
    mocks.social.mockRejectedValue(new TypeError("Failed to fetch"));
    render(<GoogleSignIn message={null} signOutStale={false} />);
    await userEvent.click(button());

    expect(await screen.findByRole("alert")).toHaveTextContent(errorMessages.AUTH_UNAVAILABLE);
  });

  it.each([
    ["a 400 rejection", () => mocks.social.mockRejectedValue({ status: 400, message: "bad" })],
    [
      "a resolved error",
      () => mocks.social.mockResolvedValue({ error: { status: 403, message: "nope" } }),
    ],
  ])("reads %s as cancelled", async (_, setup) => {
    setup();
    render(<GoogleSignIn message={null} signOutStale={false} />);
    await userEvent.click(button());

    expect(await screen.findByRole("alert")).toHaveTextContent(signInMessages.cancelled);
    expect(button()).toBeEnabled();
  });

  it("finishes the Google return with getSession, then goes to /admin", async () => {
    window.history.replaceState(null, "", "/admin/sign-in?neon_auth_session_verifier=v1");
    let resolve!: (value: { data: unknown; error: unknown }) => void;
    mocks.getSession.mockReturnValue(new Promise((r) => (resolve = r)));
    render(<GoogleSignIn message={null} signOutStale={false} />);

    await waitFor(() => expect(button()).toHaveTextContent("Signing you in…"));
    expect(button()).toBeDisabled();
    expect(button()).toHaveAttribute("aria-busy", "true");
    expect(mocks.getSession).toHaveBeenCalledTimes(1);

    resolve({ data: { session: { id: "s" }, user: { email: "a@b.c" } }, error: null });
    await waitFor(() => expect(mocks.navigateTo).toHaveBeenCalledWith("/admin"));
  });

  it("shows the cancelled message when the return brings no session", async () => {
    window.history.replaceState(null, "", "/admin/sign-in?neon_auth_session_verifier=v1");
    render(<GoogleSignIn message={null} signOutStale={false} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(signInMessages.cancelled);
    expect(button()).toBeEnabled();
    expect(mocks.navigateTo).not.toHaveBeenCalled();
  });

  it("shows unavailable when the return fails with a 500", async () => {
    window.history.replaceState(null, "", "/admin/sign-in?neon_auth_session_verifier=v1");
    mocks.getSession.mockResolvedValue({ data: null, error: { status: 500 } });
    render(<GoogleSignIn message={null} signOutStale={false} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(errorMessages.AUTH_UNAVAILABLE);
    expect(mocks.navigateTo).not.toHaveBeenCalled();
  });

  it("signs a refused account out once", async () => {
    const { rerender } = render(
      <GoogleSignIn message={errorMessages.FORBIDDEN} signOutStale={true} />,
    );
    rerender(<GoogleSignIn message={errorMessages.FORBIDDEN} signOutStale={true} />);

    await waitFor(() => expect(mocks.signOut).toHaveBeenCalledTimes(1));
    expect(mocks.getSession).not.toHaveBeenCalled();
  });

  it("doesn't sign out otherwise", async () => {
    render(<GoogleSignIn message={null} signOutStale={false} />);
    await userEvent.click(button());
    expect(mocks.signOut).not.toHaveBeenCalled();
  });
});
